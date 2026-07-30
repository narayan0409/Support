import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.settings import settings
from backend.database.models import ChatMessage, ChatSession, User
from backend.database.session import AsyncSessionLocal, get_db
from openai import RateLimitError as OpenAIRateLimitError
from backend.services.rag_service import OpenAIConfigError, RAGService
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Engine"])


class ChatPayload(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=64)
    message: str = Field(..., min_length=1, max_length=10000)


@router.post("", status_code=status.HTTP_200_OK)
async def stream_chat_endpoint(
    payload: ChatPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    result = await db.execute(select(ChatSession).where(ChatSession.id == payload.session_id, ChatSession.user_id == current_user.id))
    session = result.scalar_one_or_none()

    if not session:
        session = ChatSession(id=payload.session_id, title=payload.message[:50], user_id=current_user.id)
        db.add(session)
        await db.commit()
        await db.refresh(session)

    history_result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc())
    )
    history_records = history_result.scalars().all()
    chat_history = [{"role": message.role, "content": message.content} for message in history_records]

    user_message = ChatMessage(session_id=session.id, role="user", content=payload.message)
    db.add(user_message)
    await db.commit()

    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENAI_API_KEY is not configured. Set it in environment variables or in backend/.env.",
        )

    rag_service = RAGService(user_id=current_user.id)

    async def event_stream_generator():
        ai_response_accumulator = []
        citations_meta = []
        try:
            for event in rag_service.query_pipeline(payload.message, chat_history):
                if "citations" in event:
                    citations_meta = event["citations"]
                    yield f"data: {json.dumps({'citations': citations_meta})}\n\n"
                if "token" in event:
                    token = event["token"]
                    ai_response_accumulator.append(token)
                    yield f"data: {json.dumps({'token': token})}\n\n"
        except OpenAIConfigError as exc:
            yield f"data: {json.dumps({'token': str(exc)})}\n\n"
            return
        except OpenAIRateLimitError:
            yield f"data: {json.dumps({'token': 'OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/account/billing or add credits to your OpenAI account.'})}\n\n"
            return
        except Exception as exc:
            yield f"data: {json.dumps({'token': f'AI service error: {str(exc)}'})}\n\n"
            return

        # Use a fresh async session to persist the message (the request session may be closed)
        async with AsyncSessionLocal() as save_session:
            async with save_session.begin():
                assistant_message = ChatMessage(
                    session_id=session.id,
                    role="assistant",
                    content="".join(ai_response_accumulator).strip(),
                    citations=json.dumps(citations_meta),
                )
                save_session.add(assistant_message)

    return StreamingResponse(event_stream_generator(), media_type="text/event-stream")