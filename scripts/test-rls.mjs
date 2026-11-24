// Comprueba contra Supabase que RLS aísla las candidaturas entre usuarios.
// Uso: npm run test:rls (lee .env.local). Sale con código 1 si algo falla.
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !publishableKey || !secretKey) {
  console.error(
    "FAIL: faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY o SUPABASE_SECRET_KEY",
  );
  process.exit(1);
}

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secretKey, noSession);

const out = (line) => process.stdout.write(`${line}\n`);
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  out(`${ok ? "PASS" : "FAIL"}  ${name}${detail && !ok ? ` (${detail})` : ""}`);
}

async function createUser(label) {
  const email = `rls-${label}-${randomUUID()}@example.com`;
  const password = `Pw-${randomUUID()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`crear usuario ${label}: ${error.message}`);
  const client = createClient(url, publishableKey, noSession);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`login ${label}: ${signInError.message}`);
  return { id: data.user.id, client };
}

const created = [];
try {
  const a = await createUser("a");
  created.push(a.id);
  const b = await createUser("b");
  created.push(b.id);

  // A inserta su candidatura
  const { data: row, error: insErr } = await a.client
    .from("applications")
    .insert({ user_id: a.id, company: "Empresa A", position: "Puesto A", status: "aplicada" })
    .select()
    .single();
  check("A puede insertar su candidatura", !insErr && row?.user_id === a.id, insErr?.message);
  if (!row) throw new Error("sin fila de A, no se puede seguir");

  const { data: ownRows } = await a.client.from("applications").select("id").eq("id", row.id);
  check("A puede leer su candidatura", ownRows?.length === 1);

  // B no puede leerla
  const { data: bRows, error: bSelErr } = await b.client
    .from("applications")
    .select("id")
    .eq("id", row.id);
  check("B no puede leer la candidatura de A", !bSelErr && bRows?.length === 0, bSelErr?.message);

  // B no puede editarla
  await b.client.from("applications").update({ company: "Hackeada" }).eq("id", row.id);
  const { data: afterUpd } = await admin
    .from("applications")
    .select("company")
    .eq("id", row.id)
    .single();
  check("B no puede editar la candidatura de A", afterUpd?.company === "Empresa A");

  // A puede editar su propia candidatura
  const { data: ownUpd, error: ownUpdErr } = await a.client
    .from("applications")
    .update({ status: "entrevista" })
    .eq("id", row.id)
    .select("status");
  check(
    "A puede editar su candidatura",
    !ownUpdErr && ownUpd?.length === 1 && ownUpd[0].status === "entrevista",
    ownUpdErr?.message,
  );

  // B no puede regalar su propia fila a A (with check de la política de update)
  const { data: bRow, error: bInsErr } = await b.client
    .from("applications")
    .insert({ user_id: b.id, company: "Empresa B", position: "Puesto B", status: "guardada" })
    .select("id")
    .single();
  if (bInsErr || !bRow) throw new Error(`B no pudo insertar su fila: ${bInsErr?.message}`);
  const { error: reassignErr } = await b.client
    .from("applications")
    .update({ user_id: a.id })
    .eq("id", bRow.id);
  const { data: bRowAfter } = await admin
    .from("applications")
    .select("user_id")
    .eq("id", bRow.id)
    .single();
  check(
    "B no puede cambiar user_id de su fila al de A",
    Boolean(reassignErr) && bRowAfter?.user_id === b.id,
    reassignErr ? `user_id final: ${bRowAfter?.user_id}` : "el update no devolvió error",
  );

  // B no puede borrarla
  await b.client.from("applications").delete().eq("id", row.id);
  const { data: afterDel } = await admin.from("applications").select("id").eq("id", row.id);
  check("B no puede borrar la candidatura de A", afterDel?.length === 1);

  // B no puede insertar con el user_id de A
  const { error: spoofErr } = await b.client
    .from("applications")
    .insert({ user_id: a.id, company: "Falsa", position: "Falsa", status: "guardada" });
  check("B no puede insertar con el user_id de A", Boolean(spoofErr));

  // Anónimo no ve nada
  const anon = createClient(url, publishableKey, noSession);
  const { data: anonRows } = await anon.from("applications").select("id").eq("id", row.id);
  check("Un usuario anónimo no puede leer candidaturas", !anonRows || anonRows.length === 0);

  // A sí puede borrar la suya
  await a.client.from("applications").delete().eq("id", row.id);
  const { data: afterOwnDel } = await admin.from("applications").select("id").eq("id", row.id);
  check("A puede borrar su candidatura", afterOwnDel?.length === 0);
} catch (err) {
  check("ejecución sin errores", false, err instanceof Error ? err.message : String(err));
} finally {
  for (const id of created) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.error(`No se pudo borrar el usuario de prueba ${id}: ${error.message}`);
  }
}

const failed = results.filter((r) => !r.ok).length;
out(
  failed === 0
    ? `\nRLS PASS: ${results.length}/${results.length} comprobaciones`
    : `\nRLS FAIL: ${failed} de ${results.length} comprobaciones fallaron`,
);
process.exit(failed === 0 ? 0 : 1);
