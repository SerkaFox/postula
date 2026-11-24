# Postula — especificación

**Postula** es un seguimiento de candidaturas para quien busca trabajo: guarda las ofertas a las que te apuntas, su estado y tus notas, y te muestra cómo va tu búsqueda.

## Usuarios
- Registro e inicio de sesión con email y contraseña (Supabase Auth). Cerrar sesión.
- Cada usuario ve solo sus datos.

## Candidaturas
Campos: empresa*, puesto*, enlace a la oferta, ubicación, modalidad (remoto / híbrido / presencial), salario (texto libre), estado* (guardada, aplicada, entrevista, oferta, rechazada), fecha de candidatura, notas.
- Crear, editar, borrar (con confirmación).
- Lista ordenada por fecha (más reciente primero), filtro por estado y búsqueda por empresa/puesto.
- Cambio rápido de estado desde la lista.

## Panel
- Totales por estado.
- Tasa de respuesta = (entrevista + oferta + rechazada) / (aplicada + entrevista + oferta + rechazada).
- Candidaturas de los últimos 7 días.

## Páginas
- `/` portada pública breve (qué es + entrar / registrarse).
- `/login`, `/registro`.
- `/panel` (privada): resumen + lista + filtros.
- `/candidaturas/nueva`, `/candidaturas/[id]` (privadas): formulario crear / editar.

## Despliegue
- Supabase (plan gratuito) y Vercel (plan gratuito), URL de producción pública.
- Usuario de prueba con datos de ejemplo para la revisión.
