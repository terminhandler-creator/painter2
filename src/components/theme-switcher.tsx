"use client";
import { useState, useEffect } from "react";
const themes = [
  { id: "default", name: "Original", dot: "#ffffff" },
  { id: "dark", name: "Dark", dot: "#818cf8" },
  { id: "warm", name: "Warm", dot: "#f59e0b" },
];
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("default");
  useEffect(() => { const s = localStorage.getItem("site-theme"); if (s && themes.some(t => t.id === s)) { setActive(s); document.documentElement.setAttribute("data-theme", s); } }, []);
  function switchTheme(id: string) { setActive(id); if (id === "default") { document.documentElement.removeAttribute("data-theme"); } else { document.documentElement.setAttribute("data-theme", id); } localStorage.setItem("site-theme", id); setOpen(false); }
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 items-end">
      <div className={`flex-col gap-2 mb-2 items-end transition-all duration-300 ${open ? "flex opacity-100 translate-y-0" : "hidden opacity-0 translate-y-2"}`}>
        {themes.map(t => (<button key={t.id} onClick={() => switchTheme(t.id)} className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${active === t.id ? "bg-white shadow-lg border border-black/10 text-slate-900" : "bg-white/80 backdrop-blur-xl border border-black/5 text-slate-600 hover:bg-white hover:shadow-md"}`}><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:t.dot}}/>{t.name}{active===t.id&&<svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>}</button>))}
      </div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg hover:shadow-xl transition-all" aria-label="Switch theme">
        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
        <span className="text-xs font-medium text-slate-700">Themes</span>
      </button>
    </div>
  );
}
