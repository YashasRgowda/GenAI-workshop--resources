import { useState } from "react";

export default function TodoList() {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);

  const add = () => {
    if (!text.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), text }]);
    setText("");
  };

  return (
    <div className="p-4 border rounded mt-4">
      <h4 className="font-medium">Todo List</h4>
      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type todo"
          className="px-2 py-1 border rounded flex-1"
        />
        <button onClick={add} className="px-3 py-1 bg-slate-700 text-white rounded">Add</button>
      </div>

      <ul className="mt-3 space-y-2">
        {items.map(item => (
          <li key={item.id} className="p-2 border rounded bg-white/3">{item.text}</li>
        ))}
      </ul>
    </div>
  );
}