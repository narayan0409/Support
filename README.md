<<<<<<< HEAD
# Enterprise AI Chatbot

This project provides a production-ready starter for an AI chatbot with a FastAPI backend, a React frontend shell, SQLAlchemy models, document upload and indexing, and a RAG-style chat flow.

## Backend

- FastAPI with JWT auth
- SQLAlchemy + SQLite
- Document upload and indexing
- Streaming chat endpoint
- Swagger docs at `/docs`

## Frontend

- React + TypeScript + Vite
- Minimal shell for integration with the backend

## Running locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Create a `.env` file in the project root or backend folder with:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

Set `OPENAI_API_KEY` in the environment to enable OpenAI-backed responses.
=======
# Support
Python Support Project
>>>>>>> d5828fdab73d42e30601db5e4ee8b7dfd8d96a8a
