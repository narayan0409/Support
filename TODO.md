# Improvement Implementation Plan - COMPLETED ✅

## ✅ Phase 1: Backend Fixes
- [x] 1. `rag_service.py` - Singleton caching for HuggingFace embeddings
- [x] 2. `models.py` - Fix `datetime.utcnow` → `datetime.now(UTC)` 
- [x] 3. `main.py` - Remove unused `AsyncSession` import
- [x] 4. `chat.py` - Fix async DB session lifecycle in streaming handler (use `AsyncSessionLocal`)
- [x] 5. Create `.env.example` file
- [x] 6. Add message length validation to `ChatPayload` (min/max)
- [x] 7. Create `SYSTEM_PROMPT.md`
- [x] 8. Add `AsyncSessionLocal` import to `chat.py`
- [x] 9. Add return type annotation to `stream_chat_endpoint`

## ✅ Phase 2: Frontend Fixes
- [x] 1. `ChatPage.tsx` - Fix JSX hierarchy for `suggestedPrompts` (moved outside chat panel, added onClick)
- [x] 2. Remove unused `hasRemoteSessions` state variable
- [x] 3. Add 401 token expiry handling via `useNavigate` redirect
- [x] 4. Add `useNavigate` import and `setToken` for auth invalidation

## ✅ Phase 3: DevOps & Polish
- [x] 1. Add `.dockerignore` (node_modules, __pycache__, .env, etc.)
- [x] 2. Add Pydantic `Field` validators for input constraints
- [x] 3. Optional `passlib` remains in requirements but custom PBKDF2 kept
