import { expect, insertApplications, kpi, login, test } from "./fixtures";

const SAMPLE = [
  { company: "Nubia Labs con un nombre bastante largo", position: "Frontend Developer React y TypeScript", status: "entrevista", location: "Barcelona" },
  { company: "Hexa Pagos", position: "Full Stack Engineer", status: "aplicada", location: "Madrid" },
  { company: "Mareo Studio", position: "React Developer", status: "oferta" },
];

test("a 320 px el panel no tiene scroll horizontal", async ({ page, user }) => {
  await insertApplications(user.id, SAMPLE);
  await page.setViewportSize({ width: 320, height: 800 });
  await login(page, user);

  await expect(page.getByRole("link", { name: "Hexa Pagos", exact: true })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("con movimiento reducido los KPI muestran ya el valor final", async ({ page, user }) => {
  await insertApplications(user.id, SAMPLE);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page, user);

  // Sin esperar a ninguna animación: el valor final está desde el principio.
  await page.getByTestId("kpi").first().waitFor();
  expect(await kpi(page, "Candidaturas").textContent()).toBe("3");
  expect(await kpi(page, "Tasa de respuesta").textContent()).toBe("67 %");
  const opacity = await page.getByTestId("kpi").first().evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe("1");
});

test("la portada y el login cargan sus ilustraciones", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("bajo control");
  await expect(page.getByAltText(/Tarjetas de ofertas de empleo/)).toBeVisible();
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogImage).toContain("/opengraph-image");
  const response = await page.request.get("/opengraph-image");
  expect(response.headers()["content-type"]).toContain("image/png");
});
