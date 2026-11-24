import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type TestUser = { id: string; email: string; password: string };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name} para los tests e2e`);
  return value;
}

let adminClient: SupabaseClient | null = null;

/** Cliente con la clave secreta: solo en los tests, nunca en la app. */
export function admin(): SupabaseClient {
  adminClient ??= createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export function uniqueEmail(label: string): string {
  return `e2e-${label}-${randomUUID()}@example.com`;
}

export async function createTestUser(label = "user"): Promise<TestUser> {
  const email = uniqueEmail(label);
  const password = `Pw-${randomUUID()}`;
  const { data, error } = await admin().auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`No se pudo crear el usuario de prueba: ${error?.message}`);
  return { id: data.user.id, email, password };
}

/** Borra el usuario (sus candidaturas caen en cascada). */
export async function deleteTestUser(id: string): Promise<void> {
  const { error } = await admin().auth.admin.deleteUser(id);
  if (error) throw new Error(`No se pudo borrar el usuario de prueba ${id}: ${error.message}`);
}

/** Busca un usuario creado desde la interfaz (registro) para poder borrarlo. */
export async function findUserIdByEmail(email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin().auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`No se pudieron listar los usuarios: ${error.message}`);
    const found = data.users.find((u) => u.email === email);
    if (found) return found.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

export type NewApplication = { company: string; position: string; status?: string; location?: string };

/** Inserta candidaturas directamente (más rápido que el formulario). */
export async function insertApplications(userId: string, rows: NewApplication[]): Promise<string[]> {
  const { data, error } = await admin()
    .from("applications")
    .insert(rows.map((row) => ({ user_id: userId, status: "aplicada", ...row })))
    .select("id");
  if (error || !data) throw new Error(`No se pudieron crear candidaturas: ${error?.message}`);
  return data.map((row) => row.id as string);
}

export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto("/login");
  await page.locator("#email").fill(user.email);
  await page.locator("#password").fill(user.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/panel$/);
}

type Fixtures = {
  /** Usuario nuevo creado con la API de administración y borrado al terminar. */
  user: TestUser;
  /** Página con la sesión de `user` iniciada, en /panel. */
  authedPage: Page;
};

// El segundo argumento se llama `provide` (no `use`) para no confundir a la regla de hooks de React.
export const test = base.extend<Fixtures>({
  user: async ({}, provide) => {
    const user = await createTestUser();
    try {
      await provide(user);
    } finally {
      await deleteTestUser(user.id);
    }
  },
  authedPage: async ({ page, user }, provide) => {
    await login(page, user);
    await provide(page);
  },
});

export { expect };

/** Valor visible de un KPI del panel por su etiqueta. */
export function kpi(page: Page, label: string) {
  return page.getByTestId("kpi").filter({ hasText: label }).locator("dd").first().locator("span[aria-hidden='true']");
}
