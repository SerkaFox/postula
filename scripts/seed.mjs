// Crea (o reutiliza) el usuario de prueba demo@postula.app y le carga ~10 candidaturas de ejemplo.
// Uso: DEMO_PASSWORD=... npm run seed (lee .env.local). Idempotente: sustituye las candidaturas del usuario.
// Usa SUPABASE_SECRET_KEY: es un script local, nunca se ejecuta en Vercel ni llega al navegador.
import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = "demo@postula.app";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const password = process.env.DEMO_PASSWORD;

const out = (line) => process.stdout.write(`${line}\n`);
const fail = (message) => {
  process.stderr.write(`SEED FAIL: ${message}\n`);
  process.exit(1);
};

if (!url || !secretKey) fail("faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
if (!password || password.length < 8) fail("define DEMO_PASSWORD (mínimo 8 caracteres) en el entorno");

const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

/** Día (YYYY-MM-DD, UTC) de hace `n` días. */
function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Momento de alta coherente con el día de la candidatura (10:00 UTC de ese día). */
function createdAt(n) {
  return `${daysAgo(n)}T10:00:00Z`;
}

const EXAMPLES = [
  {
    company: "Idealista",
    position: "Frontend Developer (React)",
    url: "https://www.idealista.com/info/trabaja-con-nosotros",
    location: "Madrid",
    work_mode: "hibrido",
    salary: "42.000 – 48.000 €",
    status: "entrevista",
    ago: 12,
    notes: "Primera entrevista con RR. HH. superada. Prueba técnica para casa: buscador con filtros en React. Siguiente: entrevista técnica el jueves.",
  },
  {
    company: "Glovo",
    position: "Software Engineer – Backend (Go)",
    url: "https://jobs.glovoapp.com",
    location: "Barcelona",
    work_mode: "hibrido",
    salary: null,
    status: "aplicada",
    ago: 3,
    notes: null,
  },
  {
    company: "Cabify",
    position: "Full Stack Engineer",
    url: "https://cabify.careers",
    location: "Madrid",
    work_mode: "presencial",
    salary: "45.000 €",
    status: "rechazada",
    ago: 19,
    notes: "Respuesta automática a los 10 días: buscan más experiencia en sistemas distribuidos.",
  },
  {
    company: "Factorial",
    position: "Product Engineer",
    url: "https://factorialhr.com/careers",
    location: "Barcelona",
    work_mode: "hibrido",
    salary: "40.000 – 50.000 €",
    status: "oferta",
    ago: 16,
    notes: "Oferta recibida: 47.000 € + stock options. Responder antes del viernes.",
  },
  {
    company: "BBVA Next Technologies",
    position: "Desarrollador/a Java Senior",
    url: null,
    location: "Madrid",
    work_mode: "hibrido",
    salary: "50.000 €",
    status: "aplicada",
    ago: 9,
    notes: "Me la recomendó una antigua compañera; pedirle que mueva el CV.",
  },
  {
    company: "Wallapop",
    position: "Mobile Developer (Kotlin)",
    url: "https://about.wallapop.com/careers",
    location: null,
    work_mode: "remoto",
    salary: null,
    status: "guardada",
    ago: 1,
    notes: "Revisar requisitos de Jetpack Compose antes de aplicar.",
  },
  {
    company: "Holded",
    position: "Frontend Engineer (Vue)",
    url: "https://www.holded.com/careers",
    location: "Barcelona",
    work_mode: "presencial",
    salary: "38.000 – 44.000 €",
    status: "rechazada",
    ago: 14,
    notes: null,
  },
  {
    company: "Travelperk",
    position: "Senior Software Engineer",
    url: "https://www.travelperk.com/careers",
    location: "Barcelona",
    work_mode: "hibrido",
    salary: "55.000 – 65.000 €",
    status: "entrevista",
    ago: 6,
    notes: "Entrevista de system design programada. Repasar colas y caché.",
  },
  {
    company: "Typeform",
    position: "Frontend Engineer – Design Systems",
    url: "https://www.typeform.com/careers",
    location: null,
    work_mode: "remoto",
    salary: null,
    status: "aplicada",
    ago: 2,
    notes: null,
  },
  {
    company: "Sngular",
    position: "Desarrollador/a Node.js",
    url: null,
    location: "Bilbao",
    work_mode: "presencial",
    salary: "35.000 €",
    status: "guardada",
    ago: 0,
    notes: "Contactar con la recruiter por LinkedIn antes de aplicar.",
  },
];

async function findUserByEmail(email) {
  for (let page = 1; page < 100; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail(`listar usuarios: ${error.message}`);
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUserByEmail(DEMO_EMAIL);
if (user) {
  const { error } = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) fail(`actualizar usuario de prueba: ${error.message}`);
  out(`Usuario ${DEMO_EMAIL} ya existía: contraseña actualizada y email confirmado.`);
} else {
  const { data, error } = await admin.auth.admin.createUser({ email: DEMO_EMAIL, password, email_confirm: true });
  if (error || !data.user) fail(`crear usuario de prueba: ${error?.message ?? "sin datos"}`);
  user = data.user;
  out(`Usuario ${DEMO_EMAIL} creado con email confirmado.`);
}

const { error: delError } = await admin.from("applications").delete().eq("user_id", user.id);
if (delError) fail(`borrar candidaturas anteriores: ${delError.message}`);

const rows = EXAMPLES.map(({ ago, ...app }) => ({
  ...app,
  user_id: user.id,
  // Las "guardadas" aún no se han enviado: sin fecha de candidatura.
  applied_on: app.status === "guardada" ? null : daysAgo(ago),
  created_at: createdAt(ago),
}));

const { data: inserted, error: insError } = await admin.from("applications").insert(rows).select("status");
if (insError) fail(`insertar candidaturas: ${insError.message}`);

const counts = {};
for (const { status } of inserted) counts[status] = (counts[status] ?? 0) + 1;
out(`Candidaturas de ejemplo: ${inserted.length} (${Object.entries(counts).map(([s, n]) => `${s}: ${n}`).join(", ")}).`);
out("SEED OK");
