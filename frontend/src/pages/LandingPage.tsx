import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Smart workspace",
    description: "Unified chat, docs, code search, and RAG insights in one premium interface.",
    accent: "#7c3aed"
  },
  {
    title: "Live streaming answers",
    description: "See AI responses appear token-by-token with citation and code support.",
    accent: "#0ea5e9"
  },
  {
    title: "Project-aware RAG",
    description: "Hybrid and semantic retrieval from your repository, documents, and notes.",
    accent: "#22c55e"
  }
];

export const LandingPage = () => (
  <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
    <section className="mx-auto flex max-w-7xl flex-col gap-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] xl:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="glass-panel relative overflow-hidden p-8 sm:p-10"
        >
          <span className="inline-flex rounded-full border border-white/10 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200">
            Premium AI Workspace
          </span>
          <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Build a developer AI workspace that feels like ChatGPT, Claude, and Cursor combined.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Collaborate with your repository, documentation, and uploaded files in a polished, enterprise-ready assistant.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-violet-500/30"
            >
              Start building
            </Link>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Explore API docs
            </a>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl" style={{ background: `${feature.accent}20` }}>
                  <span className="text-lg font-semibold text-white">•</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="relative rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
        >
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-violet-500 via-sky-500 to-teal-400 opacity-20 blur-3xl" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Workspace stats</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Dashboard</h2>
              </div>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-200">Live</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Files indexed</p>
                <p className="mt-3 text-2xl font-semibold text-white">128</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Active chats</p>
                <p className="mt-3 text-2xl font-semibold text-white">12</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Model</p>
                <p className="mt-3 text-2xl font-semibold text-white">GPT-5 / MPT</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Embedding size</p>
                <p className="mt-3 text-2xl font-semibold text-white">24k</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white">Suggested prompts</h2>
          <div className="mt-5 space-y-3 text-slate-300">
            {[
              "Explain this repository",
              "Review my code",
              "Find bugs",
              "Generate tests",
              "Optimize performance",
              "Explain architecture"
            ].map((item) => (
              <button key={item} className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-white/10">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white">AI modes</h2>
          <div className="mt-5 grid gap-3">
            {[
              "Agent mode",
              "Code review",
              "Security audit",
              "Documentation analysis"
            ].map((mode) => (
              <div key={mode} className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4">
                <p className="font-semibold text-white">{mode}</p>
                <p className="mt-2 text-sm text-slate-400">Premium assistant for advanced repository workflows.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-white">Repository features</h2>
          <ul className="mt-5 space-y-3 text-slate-300">
            <li>File explorer</li>
            <li>Semantic code search</li>
            <li>Document preview</li>
            <li>Metadata filtering</li>
          </ul>
        </div>
      </section>
    </section>
  </main>
);
