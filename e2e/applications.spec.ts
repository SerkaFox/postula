import { createTestUser, deleteTestUser, expect, insertApplications, kpi, login, test } from "./fixtures";

test("crear dos candidaturas desde el formulario", async ({ authedPage: page }) => {
  const items = [
    { company: "Nubia Labs", position: "Frontend Developer" },
    { company: "Hexa Pagos", position: "Full Stack Engineer" },
  ];
  for (const item of items) {
    await page.getByRole("link", { name: /Nueva candidatura|Añadir mi primera candidatura/ }).first().click();
    await expect(page).toHaveURL(/\/candidaturas\/nueva$/);
    await page.getByRole("textbox", { name: "Empresa", exact: true }).fill(item.company);
    await page.getByRole("textbox", { name: "Puesto", exact: true }).fill(item.position);
    await page.getByRole("textbox", { name: "Ubicación", exact: true }).fill("Madrid");
    await page.getByRole("button", { name: "Crear candidatura" }).click();
    await expect(page).toHaveURL(/\/panel\?aviso=creada$/);
    await expect(page.getByText("Candidatura creada.")).toBeVisible();
  }

  for (const item of items) {
    await expect(page.getByRole("link", { name: item.company, exact: true })).toBeVisible();
  }
  await expect(kpi(page, "Candidaturas")).toHaveText("2");
});

test("el formulario valida los campos obligatorios", async ({ authedPage: page }) => {
  await page.goto("/candidaturas/nueva");
  await page.getByRole("button", { name: "Crear candidatura" }).click();
  await expect(page.locator("#company-error")).toBeVisible();
  await expect(page).toHaveURL(/\/candidaturas\/nueva$/);
});

test("el cambio rápido de estado actualiza las cifras", async ({ page, user }) => {
  await insertApplications(user.id, [
    { company: "Acme", position: "Frontend" },
    { company: "Globex", position: "Backend" },
  ]);
  await login(page, user);

  await expect(kpi(page, "Tasa de respuesta")).toHaveText("0 %");
  await page.getByLabel("Estado de Frontend en Acme").selectOption("entrevista");
  await expect(kpi(page, "Tasa de respuesta")).toHaveText("50 %");
  await expect(page.getByRole("navigation", { name: "Filtrar por estado" }).getByRole("link", { name: /^Entrevista/ })).toContainText("1");

  // Persistido en el servidor.
  await page.reload();
  await expect(page.getByLabel("Estado de Frontend en Acme")).toHaveValue("entrevista");
});

test("filtro por estado y búsqueda", async ({ page, user }) => {
  await insertApplications(user.id, [
    { company: "Acme", position: "Frontend", status: "entrevista" },
    { company: "Globex", position: "Backend", status: "aplicada" },
    { company: "Initech", position: "Diseñador UX", status: "rechazada" },
  ]);
  await login(page, user);

  const filters = page.getByRole("navigation", { name: "Filtrar por estado" });
  await filters.getByRole("link", { name: /^Entrevista/ }).click();
  await expect(page).toHaveURL(/estado=entrevista/);
  await expect(page.getByRole("link", { name: "Acme", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Globex", exact: true })).toHaveCount(0);

  await filters.getByRole("link", { name: /^Todas/ }).click();
  await expect(page).toHaveURL(/\/panel$/);
  await page.getByRole("searchbox", { name: "Buscar por empresa o puesto" }).fill("disenador");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/q=disenador/);
  await expect(page.getByRole("link", { name: "Initech", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Acme", exact: true })).toHaveCount(0);

  await page.getByRole("searchbox", { name: "Buscar por empresa o puesto" }).fill("no-existe");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText("No hay candidaturas que coincidan.")).toBeVisible();
  await page.getByRole("link", { name: "Quitar filtros" }).click();
  await expect(page.getByRole("link", { name: "Globex", exact: true })).toBeVisible();
});

test("editar una candidatura", async ({ page, user }) => {
  await insertApplications(user.id, [{ company: "Acme", position: "Frontend" }]);
  await login(page, user);

  await page.getByRole("link", { name: "Editar Frontend en Acme" }).click();
  await expect(page.getByRole("heading", { name: "Acme" })).toBeVisible();
  await page.getByRole("textbox", { name: "Puesto", exact: true }).fill("Frontend Senior");
  await page.getByRole("textbox", { name: "Notas", exact: true }).fill("Entrevista técnica el jueves");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page).toHaveURL(/\/panel\?aviso=guardada$/);
  await expect(page.getByText("Cambios guardados.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Editar Frontend Senior en Acme" })).toBeVisible();
});

test("borrar pide confirmación", async ({ page, user }) => {
  await insertApplications(user.id, [
    { company: "Acme", position: "Frontend" },
    { company: "Globex", position: "Backend" },
  ]);
  await login(page, user);

  await page.getByRole("button", { name: "Borrar Frontend en Acme" }).click();
  const confirm = page.getByRole("group", { name: "Confirmar borrado de Frontend en Acme" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("link", { name: "Acme", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Borrar Frontend en Acme" }).click();
  await page.getByRole("button", { name: "Sí, borrar" }).click();
  await expect(page.getByRole("link", { name: "Acme", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Globex", exact: true })).toBeVisible();
  await expect(kpi(page, "Candidaturas")).toHaveText("1");
});

test("la candidatura de otro usuario da 404", async ({ authedPage: page }) => {
  const other = await createTestUser("ajeno");
  try {
    const [foreignId] = await insertApplications(other.id, [{ company: "Secreta SA", position: "Privado" }]);
    await page.goto(`/candidaturas/${foreignId}`);
    await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
    await expect(page.getByText("Secreta SA")).toHaveCount(0);
  } finally {
    await deleteTestUser(other.id);
  }
});
