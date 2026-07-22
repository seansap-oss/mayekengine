/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { MessageSquare, BookOpen, Key, Sparkles, Globe, ArrowRight, ShieldCheck } from "lucide-react";
import ChatPlayground from "./components/ChatPlayground";
import DictionaryHub from "./components/DictionaryHub";
import DeveloperPortal from "./components/DeveloperPortal";

const examples = [
  { label: "paaba", result: "paba" },
  { label: "kari", result: "kari" },
  { label: "thaba", result: "thaba" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("playground");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="bg-slate-900 text-white p-3 text-center text-sm sm:text-base">
        🚀 Manipuri keyboard auto-correct is coming soon. Join the waitlist for early access.
      </div>

      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 text-slate-900 font-semibold text-lg">
            <Sparkles className="text-sky-500" />
            <span>MeiteiRoman</span>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {[
              { id: "playground", name: "Playground", icon: MessageSquare },
              { id: "dictionary", name: "Dictionary", icon: BookOpen },
              { id: "developers", name: "Developers", icon: Key },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeTab === tab.id
                    ? "bg-slate-100 text-slate-900 shadow"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <tab.icon size={16} className="inline-block mr-2" />
                {tab.name}
              </button>
            ))}
          </div>

          <button className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700">
            Join Mobile App Waitlist
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {activeTab === "playground" ? (
          <>
            <section className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm">
                  <ShieldCheck size={16} />
                  Trusted spelling standardization for Manipuri chat
                </div>
                <div className="space-y-5">
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                    Standardize Roman Manipuri Chat
                  </h1>
                  <p className="max-w-xl text-lg leading-8 text-slate-600">
                    Transform WhatsApp typing into precise Manipuri romanization with smart auto-correct suggestions, phrase standardization, and a clean mobile experience built for everyday conversation.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <button className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Join Mobile App Waitlist
                    </button>
                    <button className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                      Learn how it works
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-sky-500/20 to-slate-200 blur-3xl" />
                <div className="relative overflow-hidden rounded-[3rem] border border-slate-200 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.15)]">
                  <div className="bg-slate-950 px-5 py-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-slate-200">
                    Live WhatsApp Chat Simulator
                  </div>
                  <div className="border-b border-slate-200 px-5 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">
                    Phone preview • 6.7&quot; screen
                  </div>
                  <div className="p-4">
                    <ChatPlayground isCompact />
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Common Spellings Standardized</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">Consistent romanized words with every message.</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-600">
                  Showcase of frequently corrected spellings so your contacts always see the same standard form in chat.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {examples.map((example) => (
                  <div key={example.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Original</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{example.label}</p>
                    <p className="mt-4 text-sm text-slate-500">Standardized to</p>
                    <p className="mt-2 text-xl font-semibold text-sky-600">{example.result}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : activeTab === "dictionary" ? (
          <DictionaryHub />
        ) : (
          <DeveloperPortal />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-semibold text-white">MeiteiRoman</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              A modern romanization experience for Manipuri chat that blends clean app design with fast, reliable spelling correction.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2">
              <Globe size={14} /> API v1.0 Live
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2">
              <ShieldCheck size={14} /> Privacy-minded by design
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
