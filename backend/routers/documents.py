import os
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.settings import settings
from backend.database.models import DocumentMetadata, User
from backend.database.session import get_db
from backend.services.rag_service import RAGService
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])


class DocumentOut(BaseModel):
    id: int
    filename: str
    file_type: str
    uploaded_at: str


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as handle:
        handle.write(await file.read())

    document = DocumentMetadata(
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type or "unknown",
        user_id=current_user.id,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    rag_service = RAGService(user_id=current_user.id)
    rag_service.process_and_index_file(file_path, file.filename)
    return {"message": "Document uploaded and indexed", "filename": file.filename}


@router.get("", response_model=List[DocumentOut])
async def list_documents(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> List[DocumentOut]:
    result = await db.execute(select(DocumentMetadata).where(DocumentMetadata.user_id == current_user.id).order_by(DocumentMetadata.uploaded_at.desc()))
    documents = result.scalars().all()
    return [DocumentOut(id=item.id, filename=item.filename, file_type=item.file_type, uploaded_at=item.uploaded_at.isoformat()) for item in documents]


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> None:
    result = await db.execute(select(DocumentMetadata).where(DocumentMetadata.id == document_id, DocumentMetadata.user_id == current_user.id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    await db.delete(document)
    await db.commit()
