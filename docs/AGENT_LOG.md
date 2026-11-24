# Registro de trabajo de los agentes

| Tarea | Vuelta | Agente | Veredicto / resultado | Detalle |
|---|---|---|---|---|
| T1+T2 | 1 | develop | entregado | Migración `applications` + RLS (4 políticas), `test-rls.mjs` 8 casos; clientes @supabase/ssr, proxy.ts, login/registro/logout con zod, /panel protegido. `check` y `test:rls` en verde. |
| T1+T2 | 1 | testing | **APROBADO** | D1–D13 sin fallos; navegador 320 px, RLS 8/8, sin claves en el bundle. Notas no bloqueantes: 404 en inglés, más casos de UPDATE en test-rls, `to_regtype` en la migración → pasan a T3/T4. |
| T3+T4 | 1 | develop | entregado | CRUD de candidaturas con Server Actions + zod, lista responsive con filtros/búsqueda/cambio rápido de estado, borrado con confirmación, panel con KPIs (`stats.ts`), portada, 404 en español, +2 casos RLS. `check` verde (38 tests), RLS 10/10. |
| T3+T4 | 1 | testing | **FALLOS (1)** | [D12] `notice.tsx`: `value in MESSAGES` acepta claves heredadas → `/panel?aviso=__proto__` tumba el panel (React #441). Resto verificado en navegador: cifras vs fórmula de SPEC, D6 con peticiones manipuladas, 320 px, foco, 404 ajeno. |
| T3+T4 | 2 | develop | corregido | `isNoticeKey` con `Object.hasOwn` en `src/lib/notices.ts` + test (`__proto__`, `toString`…); notas: zod para `goToPanel`, `buttonStyles` en pantallas de error. 40 tests. |
| T3+T4 | 2 | testing | **APROBADO** | Fallo cerrado en navegador; sin regresiones (CRUD, cifras, D6, 320 px, foco); RLS 10/10. |
| T5 | 1 | develop | entregado | `scripts/seed.mjs` idempotente (usuario demo + 10 candidaturas), README con el equipo de agentes y diagrama, email visible (recortado) en móvil. |
| T5 | 1 | testing | **APROBADO** | Seed ×2 sin duplicados, contraseña ausente de todo el historial, README verificado contra el repo, mermaid válido, 320 px en local y producción, RLS 10/10. |
| Final | — | orquestador | desplegado | Producción en Vercel: https://postula-candidaturas.vercel.app (pública, sin Vercel Authentication). |
| T6+T7 | 1 | develop | entregado | Ilustraciones de Codex integradas, animaciones CSS con `prefers-reduced-motion`, imagen OG; Playwright e2e (13 tests) y GitHub Actions. 47 unit + 13 e2e en verde. |
| T6+T7 | 1 | testing | **APROBADO** | D16: solo transform/opacity, CLS 0,0000, reduced-motion verificado; D17: next/image, un solo preload, ≤ 46 KB; CI reproducido sin secretos; contraste AA del h1 medido. Notas → T8. |
