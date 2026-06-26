# Supply Generation Dashboard · Seeds

Tablero interno del proyecto interárea **Supply Generation** (Marketing + Attraction).
Mide, semana a semana, si los canales activados están generando talento calificado
(Data, Tech, IA) para las búsquedas abiertas.

- **Sitio público** (sin login ni contraseña): cualquiera con el link ve y carga datos.
- **Carga 100% manual** desde el propio tablero.
- Funnel semanal calculado **automáticamente** a partir del detalle cargado.

## Stack

- Next.js (App Router, TypeScript) + React
- Tailwind CSS
- Recharts (gráfico combinado línea + barras)
- Supabase (Postgres) con la **anon/publishable key** desde el cliente
- Deploy en Vercel

---

## 🚀 Puesta en marcha (paso a paso, sin tecnicismos)

El código ya está en este repo. Solo necesitás hacer los clicks en **Supabase** y **Vercel**.

### A. El código ya está en GitHub

Este proyecto ya vive en el repositorio **`mkt-attraction`**. No tenés que subir nada a mano:
los cambios se pushean a la rama indicada y desde ahí lo conectás a Vercel (paso C).

> Si en algún momento querés clonarlo localmente para probar:
> 1. Instalá [Node.js 20+](https://nodejs.org).
> 2. En la carpeta del proyecto: `npm install`
> 3. Copiá `.env.local.example` a `.env.local` y completá las 2 variables (ver paso B4).
> 4. `npm run dev` y abrí http://localhost:3000

### B. Crear la base de datos en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta (gratis).
2. **New project** → ponele un nombre (ej. `supply-generation`), elegí una contraseña
   para la base (guardala) y una región cercana (ej. South America). Esperá ~1 minuto a
   que termine de crearse.
3. En el menú izquierdo entrá a **SQL Editor** → **New query**. Abrí el archivo
   [`supabase.sql`](./supabase.sql) de este repo, **copiá todo su contenido**, pegalo en
   el editor y apretá **Run**. Eso crea las tablas, índices y los permisos públicos.
4. Andá a **Project Settings** (el engranaje) → **API**. Vas a necesitar dos datos:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public** key (también llamada *publishable key*) — la clave larga bajo
     "Project API keys".

   👉 Anotá esos dos valores: los usás en el paso C.

### C. Deployar en Vercel (público, sin contraseña)

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión **con tu cuenta de GitHub**.
2. **Add New… → Project** → buscá el repo **`mkt-attraction`** y apretá **Import**.
3. Vercel detecta Next.js solo. Antes de deployar, abrí **Environment Variables** y cargá
   estas dos (con estos nombres EXACTOS):

   | Name                            | Value                                  |
   | ------------------------------- | -------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | la *Project URL* del paso B4           |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la *anon public* key del paso B4       |

4. Apretá **Deploy** y esperá a que termine. Te va a dar una URL pública
   (ej. `https://mkt-attraction.vercel.app`).
5. **Listo.** Esa URL es pública: cualquiera con el link entra, ve el funnel y puede
   cargar datos. No hay login ni contraseña (es a propósito, es una herramienta interna).

> Si más adelante cambiás una variable de entorno en Vercel, acordate de hacer
> **Redeploy** para que tome el cambio.

---

## 🧭 Cómo se usa

- **Funnel semanal**: métricas acumuladas arriba, gráfico de las últimas semanas
  (línea = views, barras = postulaciones; scrolleá horizontalmente para ver más),
  y un acordeón con el detalle de cada semana.
- **Cargar / modificar datos**: elegí una semana existente o creá una nueva con una fecha,
  escribí los insights, y agregá/editá/borrá oportunidades y contenidos. Al cargar un
  contenido podés tildar qué oportunidades aparecieron en él. El funnel se recalcula solo.

## 🗃️ Modelo de datos

- **weeks** — una fila por semana (agrupada por el lunes) + texto de insights.
- **opportunities** — búsquedas mostradas en la semana (rol, empresa, seniority,
  postulaciones, presentados, confirmados, fecha opcional).
- **contents** — piezas publicadas (canal, título, views, URL opcional).
- **content_opportunities** — vínculo muchos-a-muchos entre contenidos y oportunidades.

El funnel de cada semana = suma del detalle (contenidos, views, postulaciones,
presentados, confirmados). No se carga a mano.

## 🔓 Nota de seguridad

Por pedido, el sitio es **público y sin autenticación**: no hay middleware ni gate de
login, y las políticas RLS de Supabase son "allow all" para que la anon key pueda leer y
escribir. Es adecuado para una herramienta interna con datos no sensibles. Si en el futuro
querés restringir el acceso, se puede agregar auth y endurecer las políticas RLS.
