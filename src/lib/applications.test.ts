import { describe, expect, it } from "vitest";
import { filterApplications, panelHref, parseFilters, sortByDateDesc } from "./applications";

const apps = [
  { id: "1", company: "Telefónica", position: "Frontend Developer", status: "aplicada" as const, applied_on: "2026-11-01", created_at: "2026-11-01T10:00:00Z" },
  { id: "2", company: "Glovo", position: "Backend Engineer", status: "entrevista" as const, applied_on: null, created_at: "2026-11-10T10:00:00Z" },
  { id: "3", company: "Cabify", position: "Full Stack", status: "aplicada" as const, applied_on: "2026-11-05", created_at: "2026-11-02T10:00:00Z" },
];

describe("parseFilters", () => {
  it("lee estado y búsqueda de la URL", () => {
    expect(parseFilters({ estado: "oferta", q: "  glovo " })).toEqual({ status: "oferta", q: "glovo" });
  });

  it("ignora estados desconocidos, arrays y búsquedas largas", () => {
    expect(parseFilters({ estado: "hackeado" })).toEqual({ status: null, q: "" });
    expect(parseFilters({ estado: ["entrevista", "oferta"], q: ["a", "b"] })).toEqual({ status: "entrevista", q: "a" });
    expect(parseFilters({ q: "x".repeat(300) }).q).toHaveLength(100);
  });
});

describe("filterApplications", () => {
  it("filtra por estado", () => {
    expect(filterApplications(apps, { status: "aplicada", q: "" }).map((a) => a.id)).toEqual(["1", "3"]);
  });

  it("busca en empresa y puesto sin distinguir mayúsculas ni acentos", () => {
    expect(filterApplications(apps, { status: null, q: "TELEFONICA" }).map((a) => a.id)).toEqual(["1"]);
    expect(filterApplications(apps, { status: null, q: "engineer" }).map((a) => a.id)).toEqual(["2"]);
  });

  it("combina filtros y devuelve vacío si nada coincide", () => {
    expect(filterApplications(apps, { status: "entrevista", q: "cabify" })).toEqual([]);
    expect(filterApplications([], { status: null, q: "" })).toEqual([]);
  });
});

describe("sortByDateDesc", () => {
  it("ordena por fecha de candidatura (o alta si falta), la más reciente primero", () => {
    expect(sortByDateDesc(apps).map((a) => a.id)).toEqual(["2", "3", "1"]);
  });
});

describe("panelHref", () => {
  it("omite filtros vacíos y codifica la búsqueda", () => {
    expect(panelHref({})).toBe("/panel");
    expect(panelHref({ status: "oferta", q: "a&b" })).toBe("/panel?estado=oferta&q=a%26b");
  });
});
