from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.models import ChatMessage, ChatSession, User
from backend.database.session import get_db
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/history", tags=["History"])


class ChatSessionOut(BaseModel):
    id: str
    title: str
    created_at: str


class ChatMessageOut(BaseModel):
    role: str
    content: str
    created_at: str


@router.get("", response_model=List[ChatSessionOut])
async def list_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> List[ChatSessionOut]:
    result = await db.execute(select(ChatSession).where(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()))
    sessions = result.scalars().all()
    return [ChatSessionOut(id=session.id, title=session.title, created_at=session.created_at.isoformat()) for session in sessions]


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(session_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> None:
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)
    await db.commit()


@router.get("/{session_id}/messages", response_model=List[ChatMessageOut])
async def get_session_messages(session_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> List[ChatMessageOut]:
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages_result = await db.execute(select(ChatMessage).where(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()))
    messages = messages_result.scalars().all()
    return [ChatMessageOut(role=msg.role, content=msg.content, created_at=msg.created_at.isoformat()) for msg in messages]
