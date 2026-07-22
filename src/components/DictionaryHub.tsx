import { useState } from "react";
import { ThumbsUp, ThumbsDown, Search } from "lucide-react";

const words = [
  { id: "1", roman: "paba", meitei: "ꯄꯥꯕ", trans: "to read", pos: "Verb", votes: 10 },
];

export default function DictionaryHub() {
  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Standardized Dictionary</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ Propose Word</button>
      </div>
      <div className="flex gap-2 mb-4 border p-2 rounded-lg">
        <Search className="text-gray-400" />
        <input placeholder="Search words..." className="w-full outline-none" />
      </div>
      <table className="w-full">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="text-left py-3">Roman</th>
            <th className="text-left">Meitei Mayek</th>
            <th className="text-left">Pos</th>
            <th className="text-left">Translation</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {words.map(w => (
            <tr key={w.id} className="border-b last:border-0">
              <td className="py-4 font-medium">{w.roman}</td>
              <td className="font-medium text-lg">{w.meitei}</td>
              <td><span className="bg-gray-100 px-2 py-1 rounded text-xs">{w.pos}</span></td>
              <td>{w.trans}</td>
              <td className="flex gap-2">
                <button className="flex items-center gap-1 text-xs"><ThumbsUp size={14} /> {w.votes}</button>
                <button className="flex items-center gap-1 text-xs"><ThumbsDown size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
