import { useState } from "react";
import { Key, Copy, Terminal } from "lucide-react";

export default function DeveloperPortal() {
  const [apiKey] = useState("mre_live_51Mv9...a8d");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4">
            <Key className="text-blue-500" />
            <h2 className="text-xl font-bold">API Access</h2>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg font-mono text-sm">
            {apiKey}
            <button className="ml-auto p-1 hover:bg-gray-200 rounded"><Copy size={16} /></button>
        </div>
      </div>
      
      <div className="bg-gray-900 text-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-4 text-gray-400">
            <Terminal />
            <h3 className="font-semibold">Interactive Sandbox (cURL)</h3>
        </div>
        <pre className="text-sm font-mono bg-black p-4 rounded-lg overflow-x-auto text-green-400">
{`curl -X POST https://api.mangaal.app/v1/transliterate \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "eina lirik paaba"}'`}
        </pre>
      </div>
    </div>
  );
}
