# Logo del dashboard

Para usar tu propia foto/logo en el ícono del header:

1. Subí una imagen a esta carpeta `public/` con el nombre exacto **`logo.png`**.
   - También sirve `.jpg`/`.jpeg` si la renombrás a `logo.png`.
   - Ideal: cuadrada (ej. 256×256). Se recorta en redondo automáticamente.
2. Hacé commit/subila al repo. En el próximo deploy de Vercel aparece sola.

Si no hay `logo.png`, el header muestra el ícono verde por defecto.

## Cómo subirla desde GitHub (sin instalar nada)

1. Entrá al repo en GitHub → carpeta `public`.
2. **Add file → Upload files** → arrastrá tu imagen renombrada `logo.png`.
3. **Commit changes** (a la rama del proyecto). Vercel redeploya y listo.
