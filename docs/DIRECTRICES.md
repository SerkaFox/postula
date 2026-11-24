# DIRECTRICES — reglas que Develop debe cumplir y Testing comprueba

Cada regla tiene un código. Testing cita el código en cada fallo.

## Calidad y verificación
- **D1** `npm run check` (eslint + `tsc --noEmit` + vitest + `next build`) pasa sin errores ni warnings de TypeScript.
- **D2** Toda lógica pura nueva en `src/lib/` tiene tests unitarios (caso normal + al menos un caso límite).
- **D3** Sin `any` explícito, sin `@ts-ignore`, sin `console.log` en el código entregado.

## Seguridad
- **D4** Ninguna clave en el repositorio. Solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` pueden llegar al navegador. `.env*` está en `.gitignore`; existe `.env.example` sin valores reales.
- **D5** Toda tabla tiene RLS activado y políticas por `auth.uid()`; `npm run test:rls` demuestra que un usuario no lee, edita ni borra datos de otro.
- **D6** Cada Server Action valida la entrada con zod en el servidor y comprueba la sesión antes de tocar datos.
- **D7** Las páginas privadas redirigen a `/login` sin sesión (comprobado en servidor, no solo en el cliente).

## Datos
- **D8** Los cambios de esquema están en `supabase/migrations/` y reproducen la base de datos desde cero.
- **D9** Las fechas se guardan en UTC (`timestamptz`/`date`) y se muestran en formato español (`dd/mm/aaaa`).

## Interfaz
- **D10** Todo el texto visible está en español.
- **D11** Cada campo de formulario tiene `<label>` asociado; los errores de validación se muestran junto al campo.
- **D12** Cada vista de datos tiene estado vacío, de carga y de error.
- **D13** Usable a 320 px de ancho sin scroll horizontal; foco visible con teclado.

## Proceso
- **D14** Develop entrega con el resumen "Hecho / Cómo probarlo / Pendiente".
- **D15** Un commit por tarea aprobada, con mensaje descriptivo.

## Diseño y movimiento
- **D16** Las animaciones son sutiles (≤ 600 ms, sin bucles que distraigan en las vistas de trabajo) y se desactivan con `prefers-reduced-motion: reduce`. Nada se anima de forma que mueva el layout (CLS).
- **D17** Las imágenes usan `next/image` con `alt` descriptivo en español (o `alt=""` si son decorativas), tamaños definidos y `priority` solo en la imagen principal visible al cargar. Ninguna imagen de `public/` pesa más de 300 KB.
