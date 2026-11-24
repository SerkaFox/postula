import { describe, expect, it } from "vitest";
import { decodeEntities, htmlToText, jobPostingSummary } from "./html-to-text";

const PAGE = `<!doctype html><html><head>
<title>Senior Java Developer &amp; Spring &ndash; Grupo Digital</title>
<meta name="description" content="Oferta en Madrid: Java 17, Spring Boot y microservicios.">
<style>.x{color:red}</style>
<script>window.secret = "no debe salir";</script>
</head><body>
<nav>Inicio | Empresas | Login</nav>
<h1>Senior Java Developer</h1>
<p>Buscamos programador/a con experiencia en <b>Spring&nbsp;Boot</b>.</p>
<ul><li>Teletrabajo 100%</li><li>Salario: 45.000&euro;</li></ul>
<!-- comentario oculto -->
<footer>© 2026 Portal</footer>
</body></html>`;

describe("htmlToText", () => {
  it("extrae título, descripción y texto visible sin scripts, estilos, nav ni pie", () => {
    const text = htmlToText(PAGE);
    expect(text).toContain("Título: Senior Java Developer & Spring – Grupo Digital");
    expect(text).toContain("Descripción: Oferta en Madrid: Java 17, Spring Boot y microservicios.");
    expect(text).toContain("Buscamos programador/a con experiencia en Spring Boot .");
    expect(text).toContain("Teletrabajo 100%\nSalario: 45.000€");
    expect(text).not.toMatch(/secret|color:red|comentario|Empresas \| Login|Portal/);
  });

  it("recorta al máximo indicado", () => {
    const long = `<body><p>${"palabra ".repeat(5000)}</p></body>`;
    const text = htmlToText(long, 500);
    expect(text.length).toBeLessThanOrEqual(501);
    expect(text.endsWith("…")).toBe(true);
  });

  it("funciona con HTML vacío o sin body", () => {
    expect(htmlToText("")).toBe("");
    expect(htmlToText("solo texto")).toBe("Texto de la página:\nsolo texto");
  });
});

describe("jobPostingSummary", () => {
  it("resume los datos JobPosting de schema.org (también dentro de @graph)", () => {
    const ld = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", name: "x" },
        {
          "@type": "JobPosting",
          title: "Backend Developer",
          hiringOrganization: { "@type": "Organization", name: "Acme" },
          jobLocation: { "@type": "Place", address: { addressLocality: "Valencia", addressCountry: "ES" } },
          description: "<p>Node.js y <b>PostgreSQL</b></p>",
        },
      ],
    };
    const html = `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
    const summary = jobPostingSummary(html);
    expect(summary).toContain("Puesto: Backend Developer");
    expect(summary).toContain("Empresa: Acme");
    expect(summary).toContain("Ubicación: Valencia ES");
    expect(summary).toContain("Descripción: Node.js y PostgreSQL");
  });

  it("ignora JSON-LD roto o sin oferta", () => {
    expect(jobPostingSummary('<script type="application/ld+json">{roto</script>')).toBe("");
    expect(jobPostingSummary('<script type="application/ld+json">{"@type":"Organization"}</script>')).toBe("");
  });
});

describe("decodeEntities", () => {
  it("decodifica entidades numéricas y con nombre", () => {
    expect(decodeEntities("Le&oacute;n &#169; &#x20AC; &iquest;s&iacute;?")).toBe("León © € ¿sí?");
  });

  it("deja intactas las desconocidas o fuera de rango", () => {
    expect(decodeEntities("&foo; &#0; &#x110000;")).toBe("&foo; &#0; &#x110000;");
  });
});
