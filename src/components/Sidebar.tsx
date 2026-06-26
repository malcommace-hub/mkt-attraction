"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/funnel",
    label: "Funnel semanal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M3 4h18M6 9h12M9 14h6M11 19h2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/cargar",
    label: "Cargar / modificar datos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white px-4 py-6 sm:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white shadow-soft">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
            <path
              d="M12 3c3 3 6 5 6 9a6 6 0 1 1-12 0c0-4 3-6 6-9Z"
              fill="currentColor"
              opacity="0.95"
            />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">Supply Generation</p>
          <p className="text-xs text-slate-400">Seeds · interno</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-accent text-white shadow-soft"
                  : "text-slate-500 hover:bg-accent-50 hover:text-accent-700",
              ].join(" ")}
            >
              <span className={active ? "text-white" : "text-slate-400 group-hover:text-accent-600"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-400">
        Marketing activa canales, Attraction convierte. El tablero mide, semana a
        semana, si los canales generan talento calificado.
      </div>
    </aside>
  );
}
