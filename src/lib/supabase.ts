"use client";

import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase usando la anon/publishable key desde el navegador.
// Es una herramienta interna y pública: las políticas RLS son "allow all".
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Si faltan las variables, usamos placeholders para que el build no rompa.
// En tiempo de ejecución, la UI avisa que falta configurar las variables.
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key"
);
