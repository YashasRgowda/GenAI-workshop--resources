// src/components/Header.jsx
export default function Header({ title }) {
  return (
    <header className="p-4 bg-slate-800 text-white rounded">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </header>
  );
}
