// src/components/Toggle.jsx
import { useState, useEffect } from "react";

export default function Toggle({ children }) {
  const [on, setOn] = useState(false);

  // Demo effect with cleanup: setInterval example (here harmless)
  useEffect(() => {
    console.log("Toggle mounted");
    const id = setInterval(() => {
    //   console.log("Toggle is mounted");
    }, 10000);
    return () => {
      clearInterval(id);
      console.log("Toggle unmounted and cleaned up");
    };
  }, []);

  return (
    <div className="p-3 border rounded mt-4">
      <button onClick={() => setOn(prev => !prev)} className="px-2 py-1 bg-slate-800 text-white rounded">
        {on ? "Hide" : "Show"} help
      </button>
      <div className="mt-3">{on ? children : <em className="text-slate-400">Help is hidden</em>}</div>
    </div>
  );
}
