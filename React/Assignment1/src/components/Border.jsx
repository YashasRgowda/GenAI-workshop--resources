export default function Border({children}){
    return (
        <div className="p-4 border-2 border-dashed rounded bg-slate-900/40">
            {children}
        </div>
    );
}