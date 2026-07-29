import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api/v1";

const generateId = () => "session-" + Math.random().toString(36).substring(2, 15);

const defaultSessions = [
  { id: generateId(), title: "New conversation" }
];

const suggestedPrompts = [
  "Explain the repository structure",
  "Find security issues in the code",
  "Review this pull request",
  "Generate test cases"
];

export const ChatPage = () => {
  const token = useAuthStore((state) => state.token);
  const [sessions, setSessions] = useState(defaultSessions);
  const [activeSessionId, setActiveSessionId] = useState(defaultSessions[0].id);
  const [history, setHistory] = useState([{ role: "assistant", content: "Welcome to your workspace. Ask about code, docs, or uploaded files." }]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hasRemoteSessions, setHasRemoteSessions] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Unable to load conversation history.");
        }
        const data = await response.json();
        if (data.length > 0) {
          setSessions(data.map((item: any) => ({ id: item.id, title: item.title })));
          setActiveSessionId(data[0].id);
          setHasRemoteSessions(true);
        }
      } catch (error) {
        setErrorMessage((error as Error).message);
      }
    };

    fetchHistory();
  }, [token]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token || !activeSessionId) return;
      try {
        const response = await fetch(`${API_BASE}/history/${activeSessionId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 404) {
          setHistory([{ role: "assistant", content: "Welcome to your workspace. Ask about code, docs, or uploaded files." }]);
          return;
        }
        if (!response.ok) {
          throw new Error("Unable to load chat messages.");
        }
        const data = await response.json();
        setHistory(data.map((item: any) => ({ role: item.role, content: item.content })));
      } catch (error) {
        setErrorMessage((error as Error).message);
      }
    };

    fetchMessages();
  }, [token, activeSessionId]);

  const filteredSessions = useMemo(
    () => sessions.filter((session) => session.title.toLowerCase().includes(search.toLowerCase())),
    [search, sessions]
  );

  const sendMessage = async () => {
    if (!message.trim() || !token) return;

    const userText = message.trim();
    setMessage("");
    setErrorMessage(null);
    setHistory((current) => [...current, { role: "user", content: userText }, { role: "assistant", content: "Typing..." }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ session_id: activeSessionId, message: userText })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || payload?.message || "Chat request failed.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming connection failed.");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          const line = chunk.trim();
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (!payload.token) continue;
            answer += payload.token;
            setHistory((current) => {
              const updated = [...current];
              updated[updated.length - 1] = { role: "assistant", content: answer };
              return updated;
            });
          } catch {
            // Ignore invalid SSE payloads
          }
        }
      }

      if (!answer.trim()) {
        throw new Error("Received empty assistant response.");
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
      setHistory((current) => [
        ...current.slice(0, -1),
        { role: "assistant", content: `Error: ${(error as Error).message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-panel flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Conversations</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Your history</h2>
            </div>
            <button className="rounded-3xl bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">New</button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-sky-400/80"
            />
          </div>

          <div className="space-y-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-3">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full rounded-3xl px-4 py-4 text-left transition ${activeSessionId === session.id ? "bg-violet-500/10 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{session.title}</span>
                  <span className="text-xs text-slate-500">3 messages</span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
            <p className="text-sm text-slate-400">Workspace metrics</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-slate-200">Files indexed: 82</div>
              <div className="rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-slate-200">Model: GPT-5</div>
            </div>
          </div>
        </aside>

        <section className="flex flex-col gap-6">
          <div className="glass-panel rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Live chat</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">AI-enabled developer assistant</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-3xl bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Agent mode</span>
                <span className="rounded-3xl bg-slate-900/80 px-4 py-2 text-sm text-slate-300">Deep research</span>
              </div>
          </div>

          </div>
          <div className="glass-panel flex min-h-[560px] flex-col gap-5 rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Active session</p>
                <h2 className="text-2xl font-semibold text-white">{sessions.find((session) => session.id === activeSessionId)?.title}</h2>
              </div>
              <div className="flex gap-2">
                <button className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">Stop</button>
                <button className="rounded-3xl bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20">Regenerate</button>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-5 overflow-hidden">
              <div className="scrollbar-thin max-h-[420px] space-y-4 overflow-y-auto pr-2">
                {history.map((item, index) => (
                  <motion.div
                    key={`${item.role}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`rounded-3xl p-5 ${item.role === "assistant" ? "bg-slate-900/80" : "bg-slate-950/80"}`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-400">
                      <span>{item.role === "assistant" ? "Assistant" : "You"}</span>
                      {item.role === "assistant" && <span className="rounded-full bg-white/5 px-3 py-1 text-xs">Stream</span>}
                    </div>
                    <div className="prose prose-invert max-w-full text-slate-100">
                      <ReactMarkdown remarkPlugins={[remarkGfm as any]}>{item.content}</ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                {errorMessage && (
                  <div className="mb-4 rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMessage}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Ask your workspace about architecture, code, or docs..."
                    className="min-h-[140px] w-full resize-none rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-white outline-none focus:border-sky-400/80"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading}
                    className="rounded-3xl bg-gradient-to-r from-violet-500 to-sky-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Generating..." : "Send message"}
                  </button>
                </div>
            </div>

            </div>
          <div className="grid gap-4 md:grid-cols-3">
          </div>
            {suggestedPrompts.map((prompt) => (
              <button key={prompt} className="glass-panel rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-left text-sm text-slate-100 transition hover:bg-white/10">
                {prompt}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};
