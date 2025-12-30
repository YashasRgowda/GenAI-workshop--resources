import Header from "./components/Header";
import ProfileCard from "./components/ProfileCard";
import Counter from "./components/Counter";
import TodoList from "./components/TodoList";
import Toggle from "./components/Toggle";
import Wrapper from "./components/Wrapper";
import { studinfo } from "./data/students";

export default function App() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-white">
      <Header title="DAY-1 GenAI session" />

      <Wrapper>
        <p className="mb-2">Below is a reusable <strong>ProfileCard</strong> component rendered for each student (props demo):</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studinfo.map(s => (
            <ProfileCard key={s.id} name={s.name} email={s.email} cgpa={s.cgpa} />
          ))}
        </div>
      </Wrapper>

      <div className="flex flex-col md:flex-row gap-6">
        <Counter />
        <TodoList />
      </div>

      <Toggle>
        <div className="p-2 bg-slate-800 rounded">
          <h4 className="font-medium">Hidden content shown inside <code>Toggle</code></h4>
          <p className="text-sm text-slate-300">This demonstrates the <code>children</code> prop.</p>
        </div>
      </Toggle>
    </div>
  );
}
