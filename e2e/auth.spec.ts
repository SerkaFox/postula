import { deleteTestUser, expect, findUserIdByEmail, test, uniqueEmail } from "./fixtures";

test("sin sesión, el panel redirige a /login", async ({ page }) => {
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("registro → panel con el estado vacío", async ({ page }) => {
  const email = uniqueEmail("registro");
  try {
    await page.goto("/registro");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("Contrasena-e2e-123");
    await page.locator("#confirmPassword").fill("Contrasena-e2e-123");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("heading", { name: "Aún no tienes candidaturas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Añadir mi primera candidatura" })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  } finally {
    const id = await findUserIdByEmail(email);
    if (id) await deleteTestUser(id);
  }
});

test("login con la contraseña incorrecta muestra un error", async ({ page, user }) => {
  await page.goto("/login");
  await page.locator("#email").fill(user.email);
  await page.locator("#password").fill("no-es-la-buena");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
