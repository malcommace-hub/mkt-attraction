export function ConfigWarning() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 shadow-soft">
      <p className="font-bold">Falta configurar la conexión a Supabase</p>
      <p className="mt-1 leading-relaxed text-amber-700">
        Definí las variables de entorno{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        y{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        (localmente en <code className="font-mono text-xs">.env.local</code> o en
        Vercel) y volvé a cargar la página.
      </p>
    </div>
  );
}
