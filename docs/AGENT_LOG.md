# Registro de trabajo de los agentes

| Tarea | Vuelta | Agente | Veredicto / resultado | Detalle |
|---|---|---|---|---|
| T1+T2 | 1 | develop | entregado | Migración `applications` + RLS (4 políticas), `test-rls.mjs` 8 casos; clientes @supabase/ssr, proxy.ts, login/registro/logout con zod, /panel protegido. `check` y `test:rls` en verde. |
| T1+T2 | 1 | testing | **APROBADO** | D1–D13 sin fallos; navegador 320 px, RLS 8/8, sin claves en el bundle. Notas no bloqueantes: 404 en inglés, más casos de UPDATE en test-rls, `to_regtype` en la migración → pasan a T3/T4. |
| T3+T4 | 1 | develop | entregado | CRUD de candidaturas con Server Actions + zod, lista responsive con filtros/búsqueda/cambio rápido de estado, borrado con confirmación, panel con KPIs (`stats.ts`), portada, 404 en español, +2 casos RLS. `check` verde (38 tests), RLS 10/10. |
| T3+T4 | 1 | testing | **FALLOS (1)** | [D12] `notice.tsx`: `value in MESSAGES` acepta claves heredadas → `/panel?aviso=__proto__` tumba el panel (React #441). Resto verificado en navegador: cifras vs fórmula de SPEC, D6 con peticiones manipuladas, 320 px, foco, 404 ajeno. |
| T3+T4 | 2 | develop | corregido | `isNoticeKey` con `Object.hasOwn` en `src/lib/notices.ts` + test (`__proto__`, `toString`…); notas: zod para `goToPanel`, `buttonStyles` en pantallas de error. 40 tests. |
| T3+T4 | 2 | testing | **APROBADO** | Fallo cerrado en navegador; sin regresiones (CRUD, cifras, D6, 320 px, foco); RLS 10/10. |
