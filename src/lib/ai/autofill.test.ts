import { describe, expect, it } from "vitest";
import {
  AI_INPUT_MAX,
  classifyInput,
  cleanValue,
  filledFields,
  isOnlyWorkMode,
  normalizeExtraction,
  normalizeWorkMode,
  offerExtractionSchema,
} from "./autofill";

const OFFER = "Empresa Acme busca Frontend Developer con React y TypeScript en Madrid, modalidad híbrida.";

describe("classifyInput", () => {
  it("reconoce un enlace http(s) o que empieza por www.", () => {
    const url = classifyInput("  https://www.tecnoempleo.com/oferta/rf-1  ");
    expect("kind" in url && url.kind === "url" && url.url.href).toBe("https://www.tecnoempleo.com/oferta/rf-1");
    const www = classifyInput("www.infojobs.net/oferta");
    expect("kind" in www && www.kind === "url" && www.url.protocol).toBe("https:");
  });

  it("trata hosts sin esquema como enlaces y aplica los mismos bloqueos", () => {
    const bare = classifyInput("empleo.example.com/oferta/1");
    expect("kind" in bare && bare.kind === "url" && bare.url.href).toBe("https://empleo.example.com/oferta/1");
    expect(classifyInput("www.localhost")).toEqual({ error: "blocked_url" });
    expect(classifyInput("localhost:3000/admin")).toEqual({ error: "blocked_url" });
    expect(classifyInput("127.0.0.1")).toEqual({ error: "blocked_url" });
    expect(classifyInput("169.254.169.254/latest")).toEqual({ error: "blocked_url" });
    // Una palabra suelta sin punto no es un host: se pide más texto.
    expect(classifyInput("Desarrollador")).toEqual({ error: "too_short" });
  });

  it("trata el resto como texto de la oferta", () => {
    expect(classifyInput(OFFER)).toEqual({ kind: "text", text: OFFER });
    expect(classifyInput(`Mira https://example.com/oferta ${OFFER}`)).toMatchObject({ kind: "text" });
  });

  it("devuelve errores claros en los casos límite", () => {
    expect(classifyInput("   ")).toEqual({ error: "empty" });
    expect(classifyInput("React en Madrid")).toEqual({ error: "too_short" });
    expect(classifyInput("x".repeat(AI_INPUT_MAX + 1))).toEqual({ error: "too_long" });
    expect(classifyInput("http://localhost:3000/oferta")).toEqual({ error: "blocked_url" });
    expect(classifyInput("ftp://example.com/oferta")).toEqual({ error: "invalid_url" });
  });
});

describe("normalizeWorkMode", () => {
  it.each([
    ["Teletrabajo", "remoto"],
    ["100% remote", "remoto"],
    ["Full remote", "remoto"],
    ["Remoto", "remoto"],
    ["Hybrid", "hibrido"],
    ["Híbrido (2 días en remoto)", "hibrido"],
    ["semipresencial", "hibrido"],
    ["Presencial", "presencial"],
    ["On-site", "presencial"],
  ] as const)("%s → %s", (input, expected) => {
    expect(normalizeWorkMode(input)).toBe(expected);
  });

  it("devuelve null si no se reconoce o no hay valor", () => {
    expect(normalizeWorkMode("Jornada completa")).toBeNull();
    expect(normalizeWorkMode("")).toBeNull();
    expect(normalizeWorkMode(null)).toBeNull();
  });
});

describe("isOnlyWorkMode", () => {
  it("distingue una modalidad de un lugar", () => {
    expect(isOnlyWorkMode("100% remoto")).toBe(true);
    expect(isOnlyWorkMode("Teletrabajo")).toBe(true);
    expect(isOnlyWorkMode("Madrid (híbrido)")).toBe(false);
    expect(isOnlyWorkMode("Valencia")).toBe(false);
  });
});

describe("cleanValue", () => {
  it("recorta y une espacios", () => {
    expect(cleanValue("  Acme   S.L. ", 200)).toBe("Acme S.L.");
    expect(cleanValue("línea 1\r\n\r\n\r\nlínea 2", 200, true)).toBe("línea 1\n\nlínea 2");
  });

  it("descarta valores de relleno y corta al máximo", () => {
    expect(cleanValue("N/A", 200)).toBeNull();
    expect(cleanValue("No especificado.", 200)).toBeNull();
    expect(cleanValue(undefined, 200)).toBeNull();
    expect(cleanValue("abcdefghij", 5)).toBe("abcd…");
  });
});

describe("normalizeExtraction", () => {
  it("mapea la salida del modelo a los campos del formulario", () => {
    const values = normalizeExtraction(
      { es_oferta: true, empresa: " Acme ", puesto: "Frontend Developer", ubicacion: "Madrid", modalidad: "Hybrid", salario: "40.000 €", notas: "React, TypeScript." },
      "https://example.com/oferta",
    );
    expect(values).toEqual({
      company: "Acme",
      position: "Frontend Developer",
      url: "https://example.com/oferta",
      location: "Madrid",
      work_mode: "hibrido",
      salary: "40.000 €",
      notes: "React, TypeScript.",
    });
    expect(filledFields(values)).toEqual(["company", "position", "url", "location", "work_mode", "salary", "notes"]);
  });

  it("pasa 'Remoto' de la ubicación a la modalidad y no usa enlaces del modelo", () => {
    const values = normalizeExtraction(
      { empresa: "Acme", puesto: "Dev", ubicacion: "100% remoto", modalidad: null, salario: "No especificado", notas: null },
      null,
    );
    expect(values.location).toBeNull();
    expect(values.work_mode).toBe("remoto");
    expect(values.url).toBeNull();
    expect(values.salary).toBeNull();
    expect(filledFields(values)).toEqual(["company", "position", "work_mode"]);
  });

  it("recorta a los límites del formulario", () => {
    const values = normalizeExtraction({ empresa: "x".repeat(500), notas: "y".repeat(3000) }, null);
    expect(values.company).toHaveLength(200);
    expect(values.notes).toHaveLength(1000);
  });
});

describe("offerExtractionSchema", () => {
  it("acepta la forma esperada con nulls", () => {
    const parsed = offerExtractionSchema.safeParse({ es_oferta: true, empresa: "Acme", puesto: null, ubicacion: null, modalidad: null, salario: null, notas: null });
    expect(parsed.success).toBe(true);
  });

  it("rechaza tipos inesperados", () => {
    expect(offerExtractionSchema.safeParse({ empresa: 42 }).success).toBe(false);
    expect(offerExtractionSchema.safeParse({ empresa: "x".repeat(10_001) }).success).toBe(false);
    expect(offerExtractionSchema.safeParse("texto").success).toBe(false);
  });
});
