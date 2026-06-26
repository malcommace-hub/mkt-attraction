"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/funnel", label: "Funnel" },
  { href: "/cargar", label: "Cargar datos" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex items-center justify-between gap-3 sm:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
            <path
              d="M12 3c3 3 6 5 6 9a6 6 0 1 1-12 0c0-4 3-6 6-9Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className="text-sm font-bold text-slate-900">Supply Generation</span>
      </div>
      <nav className="flex gap-1 rounded-full bg-white p-1 shadow-soft">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active ? "bg-accent text-white" : "text-slate-500",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
