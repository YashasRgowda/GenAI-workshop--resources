// src/App.jsx
import { useState } from "react";
import Header from "./components/Header";
import ProfileCard from "./components/ProfileCard";
import Counter from "./components/Counter";
import TodoList from "./components/TodoList";
import Toggle from "./components/Toggle";
import Border from "./components/Border";
import { students } from "./data/students";

export default function App() {
  const [showToggle, setShowToggle] = useState(true);

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-white">
      <Header title="Student Dashboard — Day 1" />

      <Border>
        <p className="mb-2">Student list (ProfileCard component used with props):</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {students.map(s => (
            <ProfileCard key={s.id} name={s.name} email={s.email} cgpa={s.cgpa} />
          ))}
        </div>
      </Border>

      <div className="flex flex-col md:flex-row gap-6">
        <Counter initial={students.length} />
        <TodoList />
      </div>

      <div>
        <button onClick={() => setShowToggle(v => !v)} className="px-3 py-1 bg-indigo-600 rounded">
          {showToggle ? "Unmount Toggle" : "Mount Toggle"}
        </button>
      </div>

      {showToggle && (
        <Toggle>
          <div className="p-2 bg-slate-800 rounded">
            <h4 className="font-medium">How to use this page</h4>
            <p className="text-sm text-slate-300">Add quick teacher notes and view student cards.</p>
          </div>
        </Toggle>
      )}
    </div>
  );
}
