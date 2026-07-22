import { useState } from "react";
import { Send, Languages } from "lucide-react";

interface ChatPlaygroundProps {
  isCompact?: boolean;
}

export default function ChatPlayground({ isCompact = false }: ChatPlaygroundProps) {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [useMeiteiScript, setUseMeiteiScript] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);

    if (value.toLowerCase().startsWith("pa")) {
      setSuggestions(["paba", "paaba", "pabak"]);
    } else if (value.toLowerCase().startsWith("kar")) {
      setSuggestions(["kari", "karri"]);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div
      className={`w-full ${isCompact ? "max-w-[22rem]" : "max-w-3xl"} mx-auto rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-900/10 text-slate-100`}
    >
      <div className="flex items-center justify-between gap-3 rounded-t-3xl bg-slate-900 px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Chat simulator</p>
          <p className="text-lg font-semibold text-white">WhatsApp-style typing preview</p>
        </div>
        <button
          onClick={() => setUseMeiteiScript((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          <Languages size={16} /> {useMeiteiScript ? "Meitei" : "Roman"}
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="rounded-3xl bg-slate-900 px-4 py-5 shadow-inner shadow-slate-950/20">
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="rounded-3xl rounded-br-none bg-slate-800 px-4 py-3 text-slate-200 shadow-sm">
                {useMeiteiScript ? "ꯄꯥꯕ" : "paba"}
              </div>
            </div>
            <div className="flex">
              <div className="rounded-3xl rounded-tl-none bg-sky-600 px-4 py-3 text-slate-950 shadow-sm">
                Standardizes `paaba` to `paba` automatically.
              </div>
            </div>
            <div className="flex justify-end">
              <div className="rounded-3xl rounded-br-none bg-slate-800 px-4 py-3 text-slate-200 shadow-sm">
                {useMeiteiScript ? "ꯊꯥꯕ" : "thaba"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-800 px-4 py-4">
          <p className="text-sm font-semibold text-slate-300">Suggested correction</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <span key={suggestion} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                  {suggestion}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-500">
                Type a few words to see live suggestions.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={text}
              onChange={handleInputChange}
              className="flex-grow rounded-full border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              placeholder="Type roman Manipuri here..."
            />
            <button className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-400">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
