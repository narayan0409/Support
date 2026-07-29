import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api/v1";

const authOptions = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to continue your AI workspace.",
    action: "Login"
  },
  register: {
    title: "Create an account",
    subtitle: "Start using the AI assistant with secure access.",
    action: "Register"
  }
};

type AuthPageProps = {
  mode: "login" | "register";
};

export const AuthPage = ({ mode }: AuthPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("Ready to authenticate.");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const config = authOptions[mode];
  const hasError = status.toLowerCase().includes("failed") || status.toLowerCase().includes("error");

  const submitLabel = useMemo(() => (mode === "login" ? "Sign in" : "Create account"), [mode]);

  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatus(`${config.action} in progress...`);

    try {
      const endpoint = mode === "login" ? "auth/login" : "auth/register";
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.detail || payload?.message || "Authentication failed");
      }

      if (!payload?.access_token) {
        throw new Error("Authentication succeeded without a token.");
      }

      setToken(payload.access_token);
      setStatus(`${config.action} successful. Redirecting...`);
      navigate("/chat");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-10">
      <div className="glass-panel w-full overflow-hidden p-8 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">{config.title}</h1>
              <p className="mt-3 text-sm text-slate-400 sm:text-base">{config.subtitle}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300 shadow-xl shadow-black/20">
              <p>Need help?</p>
              <p className="mt-1 text-white">Contact your workspace admin.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-200">Email</label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-400/80"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-200">Password</label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 pr-28 text-white outline-none transition focus:border-violet-400/80"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-slate-800 text-violet-500"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-sm font-semibold text-slate-300 transition hover:text-white">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-violet-500 to-sky-500 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
                >
                  {isLoading ? `${config.action}...` : submitLabel}
                </button>

<div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
                  <p className={hasError ? "text-orange-300" : "text-slate-300"}>{status}</p>
                </div>

                <div className="text-center text-sm text-slate-400">
                  {mode === "login" ? (
                    <p>Don&apos;t have an account? <Link to="/register" className="font-semibold text-violet-300 hover:text-violet-200">Create one</Link></p>
                  ) : (
                    <p>Already have an account? <Link to="/login" className="font-semibold text-violet-300 hover:text-violet-200">Sign in</Link></p>
                  )}
                </div>
            </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
                <h2 className="text-lg font-semibold text-white">Quick access</h2>
                <div className="mt-5 space-y-3">
                  {[
                    { label: "Google", hint: "Coming soon" },
                    { label: "GitHub", hint: "Coming soon" }
                  ].map((item) => (
                    <button
                      key={item.label}
                      disabled
                      className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-slate-200 opacity-70"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-slate-400">{item.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
                <h2 className="text-lg font-semibold text-white">Your workspace</h2>
                <div className="mt-5 grid gap-3 text-sm text-slate-300">
                  <div className="rounded-3xl bg-slate-900/70 p-4">Secure authentication with enterprise-friendly controls.</div>
                  <div className="rounded-3xl bg-slate-900/70 p-4">Future OAuth integrations for Google and GitHub.</div>
                  <div className="rounded-3xl bg-slate-900/70 p-4">Persistent login with remember me and notifications.</div>
                </div>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </main>
  );
};
