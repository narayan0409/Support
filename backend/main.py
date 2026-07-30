from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config.settings import settings
from backend.database.models import Base
from backend.database.session import engine
from backend.routers import auth, chat, documents, history

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0", docs_url="/docs", redoc_url="/redoc")

allowed_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()] if settings.CORS_ORIGINS != "*" else ["*"]
allow_credentials = False if settings.CORS_ORIGINS == "*" else True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root() -> dict:
    return {"message": "Enterprise AI chatbot backend is running"}


@app.on_event("startup")
async def startup() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
