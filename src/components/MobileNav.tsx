export function MobileNav() {
  return (
    <div className="mb-6 flex items-center gap-2 sm:hidden">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
          <path d="M12 3c3 3 6 5 6 9a6 6 0 1 1-12 0c0-4 3-6 6-9Z" fill="currentColor" />
        </svg>
      </div>
      <span className="text-sm font-bold text-slate-900">Supply Generation</span>
    </div>
  );
}
