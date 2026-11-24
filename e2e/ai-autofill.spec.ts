import { expect, test } from "./fixtures";

// Llama de verdad a Gemini: solo se ejecuta si hay clave en el entorno.
test.skip(!process.env.GEMINI_API_KEY, "Sin GEMINI_API_KEY no se prueba el autorrelleno con IA");

const OFFER = `Desarrollador/a Frontend React – Nubia Labs
Nubia Labs, empresa de software de Valencia, busca un/a desarrollador/a frontend con 3 años de experiencia en React y TypeScript.
Modalidad: híbrida (2 días en oficina en Valencia).
Salario: 38.000 – 44.000 € brutos/año.
Requisitos: React, TypeScript, testing con Vitest, accesibilidad web.`;

test("rellenar con IA desde el texto de una oferta y guardar", async ({ authedPage: page }) => {
  test.setTimeout(120_000);
  await page.goto("/candidaturas/nueva");
  await page.getByLabel("Enlace o texto de la oferta").fill(OFFER);
  await page.getByRole("button", { name: "Rellenar con IA" }).click();
  const done = page.getByText(/^Rellenado:/);
  const failure = page.getByRole("region", { name: "Rellenar con IA" }).getByRole("alert");
  await expect(done.or(failure)).toBeVisible({ timeout: 75_000 });
  if (await failure.isVisible()) {
    const message = await failure.innerText();
    // Caída o saturación de Gemini: es un problema externo, no de la app.
    test.skip(/saturada|No hemos podido contactar con la IA/.test(message), `Gemini no disponible: ${message}`);
    throw new Error(`El autorrelleno falló: ${message}`);
  }

  const company = page.getByRole("textbox", { name: "Empresa", exact: true });
  const position = page.getByRole("textbox", { name: "Puesto", exact: true });
  await expect(company).toHaveValue(/\S/);
  await expect(position).toHaveValue(/\S/);
  const companyName = (await company.inputValue()).trim();

  await page.getByRole("button", { name: "Crear candidatura" }).click();
  await expect(page).toHaveURL(/\/panel\?aviso=creada$/);
  await expect(page.getByText(companyName).first()).toBeVisible();
});
