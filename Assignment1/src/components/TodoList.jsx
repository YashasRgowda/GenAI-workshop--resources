// src/components/TodoList.jsx
import { useState, useEffect } from "react";

export default function TodoList() {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("todos_v1");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setItems(parsed);
        console.log("Loaded todos from localStorage");
      } catch (err) {
        console.warn("Failed to parse todos", err);
      }
    }
  }, []);

  // Save to localStorage whenever `items` changes
  useEffect(() => {
    localStorage.setItem("todos_v1", JSON.stringify(items));
    console.log("Saved todos to localStorage, count =", items.length);
  }, [items]);

  const add = () => {
    if (!text.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), text }]);
    setText("");
  };

  const remove = (id) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  return (
    <div className="p-4 border rounded mt-4">
      <h4 className="font-medium">Teacher Notes (Todos)</h4>

      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note..."
          className="px-2 py-1 border rounded flex-1"
        />
        <button onClick={add} className="px-3 py-1 bg-slate-700 text-white rounded">Add</button>
      </div>

      <ul className="mt-3 space-y-2">
        {items.map(item => (
          <li key={item.id} className="p-2 border rounded bg-white/3 flex justify-between items-center">
            <span>{item.text}</span>
            <button onClick={() => remove(item.id)} className="ml-3 px-2 py-1 bg-red-600 rounded text-sm">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
