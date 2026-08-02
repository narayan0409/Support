import os
import json
from typing import List, Dict, Any, Generator
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from backend.config.settings import settings


class OpenAIConfigError(RuntimeError):
    pass

_EMBEDDINGS_CACHE: dict[str, HuggingFaceEmbeddings] = {}

def _get_embeddings() -> HuggingFaceEmbeddings:
    model_name = "all-MiniLM-L6-v2"
    if model_name not in _EMBEDDINGS_CACHE:
        _EMBEDDINGS_CACHE[model_name] = HuggingFaceEmbeddings(model_name=model_name)
    return _EMBEDDINGS_CACHE[model_name]

class RAGService:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.persist_directory = os.path.join(settings.VECTOR_DB_DIR, f"user_{user_id}")
        self._vector_store = None
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    @property
    def vector_store(self) -> Chroma:
        if self._vector_store is None:
            self._vector_store = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=_get_embeddings(),
            )
        return self._vector_store

    def _index_text(self, text_content: str, filename: str, page: int = 1):
        """Split text content and add chunks to the vector store."""
        if not text_content:
            return
        chunks = self.text_splitter.split_text(text_content)
        docs = [
            Document(page_content=chunk, metadata={"source": filename, "page": page})
            for chunk in chunks
        ]
        self.vector_store.add_documents(docs)

    def process_and_index_file(self, file_path: str, filename: str):
        """Parses files dynamically by extension and adds chunks to the vector database"""
        ext = os.path.splitext(filename)[1].lower()
        text_content = ""

        if ext in (".txt", ".md"):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text_content = f.read()
            self._index_text(text_content, filename)
        elif ext == ".pdf":
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    self._index_text(page_text, filename, page=page_num + 1)
        elif ext == ".docx":
            import docx2txt
            text_content = docx2txt.process(file_path)
            self._index_text(text_content, filename)
        elif ext == ".csv":
            import csv
            rows = []
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                reader = csv.reader(f)
                for row in reader:
                    if row:
                        rows.append(", ".join(cell.strip() for cell in row))
            text_content = "\n".join(rows)
            self._index_text(text_content, filename)
        elif ext in (".xlsx", ".xls"):
            import pandas as pd
            excel_file = pd.ExcelFile(file_path)
            all_text = []
            for sheet_name in excel_file.sheet_names:
                df = excel_file.parse(sheet_name)
                sheet_lines = [f"Sheet: {sheet_name}"]
                sheet_lines.append("\t".join(str(col) for col in df.columns))
                for _, row in df.iterrows():
                    values = [str(v) for v in row.tolist() if str(v) != "nan"]
                    if values:
                        sheet_lines.append("\t".join(values))
                all_text.append("\n".join(sheet_lines))
            text_content = "\n\n".join(all_text)
            self._index_text(text_content, filename)
        else:
            # Fallback: try reading as plain text
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text_content = f.read()
                self._index_text(text_content, filename)
            except Exception:
                return

    def query_pipeline(self, query: str, chat_history: List[Dict[str, str]]) -> Generator[Dict[str, Any], None, None]:
        """
        Executes synchronous retrieval and yields real-time generation tokens 
        with integrated deterministic source citation.
        """
        # Step 1: Semantic Search Retrieval bounded by User Knowledge Space
        retrieved_docs = self.vector_store.similarity_search(query, k=4)
        
        context_str = ""
        citations = []
        for doc in retrieved_docs:
            source = doc.metadata.get("source", "Unknown")
            page = doc.metadata.get("page", 1)
            context_str += f"\n--- Source: {source} (Page {page}) ---\n{doc.page_content}\n"
            citations.append({"source": source, "page": page})

        # Strict RAG Prompt Template matching requirement #7 and #8
        system_prompt = (
            "You are an enterprise AI assistant trained strictly on your project knowledge base.\n"
            "Answer the question using ONLY the provided context below. Do not assume or extrapolate.\n"
            "If the answer cannot be confidently derived from the context, respond EXACTLY with:\n"
            "\"I couldn't find that information in the uploaded documents.\"\n\n"
            f"--- START CONTEXT ---\n{context_str}\n--- END CONTEXT ---"
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])

        # Convert historical format safely to LangChain objects
        lc_history = []
        for msg in chat_history:
            if msg["role"] == "user":
                lc_history.append(("human", msg["content"]))
            else:
                lc_history.append(("ai", msg["content"]))

        if not settings.OPENAI_API_KEY:
            raise OpenAIConfigError(
                "OPENAI_API_KEY is not configured. Set OPENAI_API_KEY in environment variables or in backend/.env"
            )

        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0.0,
            api_key=settings.OPENAI_API_KEY,
            streaming=True,
        )

        chain = prompt | llm

        # Stream responses chunks back to controller
        first_chunk = True
        for chunk in chain.stream({"input": query, "history": lc_history}):
            if first_chunk:
                # Provide citations metadata inside structural header framework safely
                yield {"citations": citations}
                first_chunk = False
            yield {"token": chunk.content}