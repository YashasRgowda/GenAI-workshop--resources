// src/components/ProfileCard.jsx
export default function ProfileCard({ name, email, cgpa }) {
  return (
    <div className="p-4 border rounded shadow-sm bg-white/5">
      <h3 className="text-lg font-medium">{name}</h3>
      <p className="text-sm text-slate-300">{email}</p>
      <p className="mt-2 text-sm">CGPA: <strong>{cgpa}</strong></p>
    </div>
  );
}
