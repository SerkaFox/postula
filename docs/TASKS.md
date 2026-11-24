# Tareas (orquestador)

| # | Tarea | Criterios de aceptación | Estado |
|---|---|---|---|
| T1 | Base de datos | Migración `applications` (campos de SPEC, enum de estado, `user_id` → auth.users, `created_at/updated_at`), RLS + políticas select/insert/update/delete por `auth.uid()`; `scripts/test-rls.mjs` crea 2 usuarios y demuestra el aislamiento. | ✅ aprobada |
| T2 | Supabase + auth | Clientes `@supabase/ssr` (server/client), `proxy.ts` que refresca la sesión, `/login` y `/registro` con validación zod, cerrar sesión, `/panel` protegido en servidor. | ✅ aprobada |
| T3 | Candidaturas CRUD | Formulario crear/editar (`/candidaturas/nueva`, `/candidaturas/[id]`), borrar con confirmación, Server Actions validadas; lista en `/panel` con filtro por estado, búsqueda y cambio rápido de estado. | ✅ aprobada (2 vueltas) |
| T4 | Panel y portada | Totales por estado, tasa de respuesta y últimos 7 días (lógica en `src/lib/stats.ts` con tests); portada pública; diseño cuidado, móvil 320 px. | ✅ aprobada (2 vueltas) |
| T5 | Datos de ejemplo + README | `scripts/seed.mjs` crea el usuario de prueba con ~10 candidaturas; README con la app, el equipo de agentes y cómo ejecutar. | pendiente |
