import { useState } from "react";
import { Send, Languages } from "lucide-react";

export default function ChatPlayground() {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [useMeiteiScript, setUseMeiteiScript] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    if (value.toLowerCase().startsWith("pab")) {
        setSuggestions(["paba", "pabak"]);
    } else {
        setSuggestions([]);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border">
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <h2 className="font-semibold">Live Transliteration</h2>
        <button 
            onClick={() => setUseMeiteiScript(!useMeiteiScript)}
            className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded-full border"
        >
            <Languages size={14} /> {useMeiteiScript ? "Meitei" : "Roman"}
        </button>
      </div>
      <div className="p-4 h-64 overflow-y-auto bg-gray-50">
        <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-bl-none w-max">
            {useMeiteiScript ? "ꯄꯥꯕ" : "paba"}
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2 mb-2">
          {suggestions.map(s => (
            <button key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                {useMeiteiScript ? "ꯄꯥꯕ" : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
            <input 
            type="text" 
            value={text} 
            onChange={handleInputChange}
            className="flex-grow p-3 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type Manipuri..."
            />
            <button className="p-3 bg-blue-600 text-white rounded-full"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
