import { useState } from "react";

export default function Toggle({ children }) {
  const [on, setOn] = useState(false);
  return (
    <div className="p-3 border rounded mt-4">
      <button onClick={() => setOn(prev => !prev)} className="px-2 py-1 bg-slate-800 text-white rounded">
        {on ? "Hide" : "Show"}
      </button>
      <div className="mt-3">
        {on ? children : <em className="text-slate-400">Content hidden</em>}
      </div>
    </div>
  );
}
