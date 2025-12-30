// src/components/Counter.jsx
import { useState, useEffect } from "react";

export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);

  // Runs once when component mounts
  useEffect(() => {
    console.log("Counter mounted with initial:", initial);
  }, []); // empty array => run once on mount

  // Runs whenever count changes
  useEffect(() => {
    console.log("Counter changed, count =", count);
  }, [count]);

  return (
    <div className="p-4 mt-4 border rounded w-48">
      <h4 className="font-medium">Counter</h4>
      <div className="flex items-center gap-2 mt-2">
        <button onClick={() => setCount(c => c - 1)} className="px-3 py-1 bg-slate-700 rounded">-</button>
        <div className="px-4">{count}</div>
        <button onClick={() => setCount(c => c + 1)} className="px-3 py-1 bg-slate-700 rounded">+</button>
      </div>
    </div>
  );
}
