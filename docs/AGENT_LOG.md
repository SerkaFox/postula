# Registro de trabajo de los agentes

| Tarea | Vuelta | Agente | Veredicto / resultado | Detalle |
|---|---|---|---|---|
| T1+T2 | 1 | develop | entregado | Migración `applications` + RLS (4 políticas), `test-rls.mjs` 8 casos; clientes @supabase/ssr, proxy.ts, login/registro/logout con zod, /panel protegido. `check` y `test:rls` en verde. |
| T1+T2 | 1 | testing | **APROBADO** | D1–D13 sin fallos; navegador 320 px, RLS 8/8, sin claves en el bundle. Notas no bloqueantes: 404 en inglés, más casos de UPDATE en test-rls, `to_regtype` en la migración → pasan a T3/T4. |
