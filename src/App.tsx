/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import {
  MessageSquare,
  BookOpen,
  Key,
  Sparkles,
  Globe,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Cpu,
  MessageCircle,
} from "lucide-react";
import ChatPlayground from "./components/ChatPlayground";
import DictionaryHub from "./components/DictionaryHub";
import DeveloperPortal from "./components/DeveloperPortal";
import HowItWorks from "./pages/HowItWorks";

const examples = [
  { label: "paaba", result: "paba" },
  { label: "kari", result: "kari" },
  { label: "thaba", result: "thaba" },
];

const tabs = [
  { id: "playground", name: "Playground", icon: MessageSquare },
  { id: "dictionary", name: "Dictionary", icon: BookOpen },
  { id: "translator", name: "Translator", icon: Globe },
  { id: "mayek-store", name: "Mayek Store", icon: ShoppingBag },
  { id: "it-av", name: "IT & AV Services", icon: Cpu },
  { id: "ask-ai", name: "Ask AI", icon: MessageCircle },
  { id: "developers", name: "Developers", icon: Key },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("playground");
  const [articleText, setArticleText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadRequirements, setLeadRequirements] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(() => window.location.pathname === "/pages/HowItWorks");

  useEffect(() => {
    const handlePopState = () => setIsHowItWorksOpen(window.location.pathname === "/pages/HowItWorks");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openHowItWorksPage = () => {
    window.history.pushState({}, "", "/pages/HowItWorks");
    setIsHowItWorksOpen(true);
  };

  const closeHowItWorksPage = () => {
    window.history.pushState({}, "", "/");
    setIsHowItWorksOpen(false);
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    setTranslatedText("");

    try {
      const response = await fetch("/api/v1/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText }),
      });

      if (!response.ok) {
        throw new Error("Translation request failed");
      }

      const result = await response.json();
      setTranslatedText(result.translation ?? "");
    } catch (error) {
      setTranslatedText("Unable to translate the article. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAskAI = async (event: any) => {
    event.preventDefault();
    setLeadStatus("Submitting your request...");
    setAiReply("");

    try {
      const response = await fetch("/api/v1/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: leadName, phone: leadPhone, requirements: leadRequirements }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const result = await response.json();
      setAiReply(result.reply ?? "Our team will contact you soon.");
      setLeadStatus("Request captured successfully.");
    } catch (error) {
      setLeadStatus("Unable to submit your request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="bg-slate-900 text-white p-3 text-center text-sm sm:text-base">
        🚀 Download the MeiteiRoman Android keyboard app and discover clean Manipuri romanization for chat.
      </div>

      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3 text-slate-900 font-semibold text-lg">
            <Sparkles className="text-sky-500" />
            <span>MeiteiRoman by MayekEngine</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isHowItWorksOpen) {
                    closeHowItWorksPage();
                  }
                }}
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

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/download-app"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              Download App
              <ArrowRight size={16} />
            </a>
            <button
              onClick={openHowItWorksPage}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Learn How It Works
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {isHowItWorksOpen ? (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">How It Works</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">MeiteiRoman by MayekEngine</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Explore the app flow and conversation layout that turns English text into standardized Roman Manipuri with a mobile-first experience.
                </p>
              </div>
              <button
                onClick={closeHowItWorksPage}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
              >
                Back to App
              </button>
            </div>
            <HowItWorks />
          </div>
        ) : activeTab === "playground" ? (
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
                    <a
                      href="/download-app"
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Download App
                    </a>
                    <button
                      onClick={openHowItWorksPage}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Learn How It Works
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
        ) : activeTab === "translator" ? (
          <section className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Full Article Translator</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Translate English copy into clean Roman Manipuri.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Paste your article or message text and get a standardized Manipuri romanization output for WhatsApp, content sharing, and local communication.
              </p>
            </div>
            <textarea
              value={articleText}
              onChange={(event) => setArticleText(event.target.value)}
              rows={10}
              placeholder="Paste English text here..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !articleText.trim()}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isTranslating ? "Translating..." : "Translate"}
              </button>
              <p className="text-sm text-slate-500">Supports long-form English text up to several thousand words.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-slate-100">
              <h3 className="text-lg font-semibold">Roman Manipuri Output</h3>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-7">{translatedText || "Your translation will appear here."}</div>
            </div>
          </section>
        ) : activeTab === "mayek-store" ? (
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Mayek Store</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">WhatsApp automation + UPI checkout.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Build a local commerce experience with automated messaging, WhatsApp order flows, and QR-based payments for GPay/UPI.
              </p>
              <ul className="mt-6 space-y-4 text-sm text-slate-600">
                <li>✓ WhatsApp-friendly order automation</li>
                <li>✓ GPay/UPI QR checkout support</li>
                <li>✓ Fast voice and text ordering workflows</li>
                <li>✓ Local delivery and digital wallet integration</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-slate-100 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Demo Checkout</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm text-slate-400">Pay with UPI</p>
                  <p className="mt-2 text-xl font-semibold text-white">GPay / PhonePe / Paytm</p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm text-slate-400">QR Code</p>
                  <div className="mt-3 h-48 w-full rounded-3xl bg-slate-800" />
                </div>
              </div>
            </div>
          </section>
        ) : activeTab === "it-av" ? (
          <section className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">IT & AV Services</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">End-to-end technology support for local businesses.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                From live event video walls and sound systems to small business IT automation, get a trusted partner for your next launch.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "WhatsApp order automation",
                "AV staging and projector setups",
                "Network and POS system support",
                "On-site training and digital signage",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-semibold text-slate-900">{item}</p>
                </div>
              ))}
            </div>
          </section>
        ) : activeTab === "ask-ai" ? (
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Ask AI</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Get a custom service quote instantly.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Share your project needs and contact details, and our AI assistant will capture the request and respond with a tailored next step.
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleAskAI}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                  <input
                    value={leadName}
                    onChange={(event) => setLeadName(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    value={leadPhone}
                    onChange={(event) => setLeadPhone(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Phone or WhatsApp number"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Project requirements</label>
                  <textarea
                    value={leadRequirements}
                    onChange={(event) => setLeadRequirements(event.target.value)}
                    rows={5}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Describe your automation, keyboard, or service needs"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Submit request
                </button>
              </form>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-slate-100 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">AI Response</p>
              <div className="mt-5 rounded-3xl bg-slate-900 p-5 text-sm leading-7 text-slate-300">
                {aiReply || "Fill the form and press Submit request to receive a quick guided response."}
              </div>
              {leadStatus && <p className="mt-4 text-sm text-slate-400">{leadStatus}</p>}
            </div>
          </section>
        ) : (
          <DeveloperPortal />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-semibold text-white">MeiteiRoman by MayekEngine</p>
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
