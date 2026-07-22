/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { MessageSquare, BookOpen, Key, Sparkles, Globe } from "lucide-react";
import ChatPlayground from "./components/ChatPlayground";
import DictionaryHub from "./components/DictionaryHub";
import DeveloperPortal from "./components/DeveloperPortal";

export default function App() {
  const [activeTab, setActiveTab] = useState("playground");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-2 text-center text-sm">
        🚀 Upcoming: Manipuri Custom Keyboard for iOS & Android! <button className="underline font-bold">Join Waitlist</button>
      </div>

      <nav className="sticky top-4 mx-4 bg-white/90 backdrop-blur-sm border shadow-lg rounded-full px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="text-blue-500" /> MeiteiRoman Engine
        </div>
        
        <div className="flex gap-2">
          {[
            { id: "playground", name: "Playground", icon: MessageSquare },
            { id: "dictionary", name: "Dictionary", icon: BookOpen },
            { id: "developers", name: "Developers", icon: Key },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${activeTab === tab.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          <Globe size={14} /> API v1.0 Live
        </div>
      </nav>

      <main className="p-6">
        {activeTab === "playground" && <ChatPlayground />}
        {activeTab === "dictionary" && <DictionaryHub />}
        {activeTab === "developers" && <DeveloperPortal />}
      </main>
    </div>
  );
}
