"use client";

import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase usando la anon/publishable key desde el navegador.
// Es una herramienta interna y pública: las políticas RLS son "allow all".

// Sanea la URL que viene de la variable de entorno: recorta espacios y, si le
// falta el esquema, le agrega https:// (así "xxxx.supabase.co" también funciona).
// Devuelve null si no se puede formar una URL http/https válida.
function sanitizeUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let value = raw.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    const u = new URL(value);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return u.origin;
    }
    return null;
  } catch {
    return null;
  }
}

const cleanUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const cleanKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseConfigured = Boolean(cleanUrl && cleanKey);

// Si faltan/están mal las variables, usamos placeholders VÁLIDOS para que el
// build (que prerenderiza las páginas) nunca rompa. En ejecución, la UI avisa
// que falta configurar las variables mediante `isSupabaseConfigured`.
export const supabase = createClient(
  cleanUrl ?? "https://placeholder.supabase.co",
  cleanKey || "placeholder-anon-key"
);
