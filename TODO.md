# Improvement Implementation Plan

## ✅ Phase 1: Backend Fixes
- [x] 1. `rag_service.py` - Singleton caching for HuggingFace embeddings
- [x] 2. `models.py` - Fix `datetime.utcnow` → `datetime.now(UTC)`
- [x] 3. `main.py` - Remove unused `AsyncSession` import
- [x] 4. `chat.py` - Fix async DB session lifecycle in streaming handler + add Pydantic validation (session_id max 64, message max 10000)
- [x] 5. Create `.env.example` file
- [x] 6. Add message length validation to `ChatPayload`
- [x] 7. Create `SYSTEM_PROMPT.md`
- [x] 8. **BONUS** - Added full multi-format document parsing (PDF, DOCX, CSV, XLSX/XLS, TXT, MD) to RAG service

## ✅ Phase 2: Frontend Fixes
- [x] 1. `ChatPage.tsx` - Fix JSX hierarchy & stray `</content>` tag (removed, tsc passes exit 0)
- [x] 2. Remove unused `hasRemoteSessions` state
- [x] 3. Add 401 token expiry handling (redirect to login) across all fetch calls
- [x] 4. Add in-chat file upload UI to train the AI with documents

## ✅ Phase 3: DevOps & Polish
- [x] 1. Add `.dockerignore`
- [x] 2. Add input validation improvements (Pydantic Field constraints)
- [x] 3. Fix README.md (removed unresolved git merge conflict markers)
- [x] 4. Document system prompt in `SYSTEM_PROMPT.md`

