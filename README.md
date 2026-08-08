# Enterprise AI Chatbot

A production-ready RAG chatbot with a **FastAPI backend**, **React + TypeScript frontend**, JWT authentication, document upload/indexing (PDF, DOCX, CSV, Excel, TXT, MD), and streaming OpenAI-powered chat with source citations.

---

## ✨ Features

### Backend
- 🔐 **JWT authentication** with secure PBKDF2 password hashing (HMAC constant-time comparison)
- 📄 **Document upload & RAG indexing** — PDF, DOCX, CSV, XLSX/XLS, TXT, MD
- 🧠 **Vector search** with ChromaDB + HuggingFace `all-MiniLM-L6-v2` embeddings
- ⚡ **Streaming chat endpoint** (Server-Sent Events) with token-by-token delivery
- 📚 **Conversation history** (sessions + messages) per user
- 📑 **Source citations** included in every AI response
- 🔎 Swagger API docs at `/docs`

### Frontend
- ⚛️ React 18 + TypeScript + Vite
- 🎨 Tailwind CSS + Framer Motion animations
- 📎 In-chat **file upload** to train the AI with your documents
- 💬 Real-time **SSE streaming** responses with Markdown rendering
- 🔄 **401 auto-redirect** on expired/invalid tokens
- 📱 Responsive glass-morphism UI

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Create virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY
```

Start the backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

Swagger docs: http://127.0.0.1:8000/docs

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 🧠 System Prompt for the AI

The AI assistant uses a strict RAG system prompt that enforces **answer-only-from-context** behavior with deterministic source citations. It is defined in [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md).

Key rules:
1. **Only answer from retrieved context** — never fabricate
2. If the answer isn't in the documents, respond exactly: *"I couldn't find that information in the uploaded documents."*
3. Cite sources inline as `[Source: filename, Page N]`

---

## 🔧 Environment Variables

See [`.env.example`](./.env.example) for the full list with comments.

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required for chat) | — |
| `OPENAI_MODEL` | Model name | `gpt-4o-mini` |
| `SECRET_KEY` | JWT signing secret — **change in production** | dev-only |
| `DATABASE_URL` | SQLite or PostgreSQL async URL | `sqlite+aiosqlite:///./sql_app.db` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `UPLOAD_DIR` | Uploaded file storage path | `./uploads` |
| `VECTOR_DB_DIR` | ChromaDB persistence path | `./vector_db` |

---

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI app, CORS, startup
├── config/settings.py      # Pydantic settings
├── database/
│   ├── models.py           # User, ChatSession, ChatMessage, DocumentMetadata
│   └── session.py          # Async engine + session factory
├── routers/
│   ├── auth.py             # Register / Login
│   ├── chat.py             # Streaming chat endpoint
│   ├── documents.py        # Upload / list / delete documents
│   └── history.py          # Chat sessions & messages
├── services/
│   └── rag_service.py      # File parsing, vector indexing, RAG pipeline
└── utils/
    └── auth.py             # JWT + password hashing

frontend/
├── src/
│   ├── App.tsx             # Routing
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx    # Login / Register
│   │   └── ChatPage.tsx    # Chat + file upload
│   └── store/
│       └── useAuthStore.ts # Zustand token store
```

---

## 📡 API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/v1/auth/register` | Register a new user | — |
| `POST` | `/api/v1/auth/login` | Login, get JWT | — |
| `POST` | `/api/v1/chat` | Stream a chat message (SSE) | ✅ |
| `POST` | `/api/v1/documents` | Upload & index a document | ✅ |
| `GET` | `/api/v1/documents` | List uploaded documents | ✅ |
| `DELETE` | `/api/v1/documents/{id}` | Delete a document | ✅ |
| `GET` | `/api/v1/history` | List chat sessions | ✅ |
| `GET` | `/api/v1/history/{id}/messages` | Get session messages | ✅ |
| `DELETE` | `/api/v1/history/{id}` | Delete a session | ✅ |

---

## 🐳 Docker

```bash
docker build -f backend/Dockerfile -t ai-chatbot .
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... ai-chatbot
```

---

## 🛡️ Security Notes

- Change `SECRET_KEY` in production (generate with `python -c "import secrets; print(secrets.token_hex(32))"`)
- Never commit your real `.env` file
- Passwords hashed with PBKDF2-SHA256 (310k iterations)
- JWT expires after 24h by default

---

## 📄 Supported File Types

| Type | Extension | Parser |
|------|-----------|--------|
| Text | `.txt` | Built-in |
| Markdown | `.md` | Built-in |
| PDF | `.pdf` | `pypdf` |
| Word | `.docx` | `docx2txt` |
| CSV | `.csv` | `csv` module |
| Excel | `.xlsx`, `.xls` | `pandas` + `openpyxl` |

