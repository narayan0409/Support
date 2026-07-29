import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.settings import settings
from backend.database.models import User
from backend.database.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

HASH_NAME = "sha256"
ITERATIONS = 310_000
SALT_BYTES = 16


def _split_password_hash(hashed_password: str):
    try:
        algorithm, iterations, salt, digest = hashed_password.split("$", 3)
        return algorithm, int(iterations), salt, digest
    except ValueError:
        raise ValueError("Invalid password hash format")


def _pbkdf2_hash(password: str, salt: str, iterations: int) -> str:
    pwd = password.encode("utf-8")
    digest = hashlib.pbkdf2_hmac(HASH_NAME, pwd, bytes.fromhex(salt), iterations)
    return digest.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        algorithm, iterations, salt, digest = _split_password_hash(hashed_password)
        if algorithm != "pbkdf2_sha256":
            return False
        expected = _pbkdf2_hash(plain_password, salt, iterations)
        return hmac.compare_digest(expected, digest)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(SALT_BYTES)
    digest = _pbkdf2_hash(password, salt, ITERATIONS)
    return f"pbkdf2_sha256${ITERATIONS}${salt}${digest}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: Optional[str] = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user
