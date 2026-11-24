import { describe, expect, it } from "vitest";
import type { ApplicationStatus } from "./applications";
import { computeStats, formatPercent, responseRate, type StatsInput } from "./stats";

const NOW = new Date("2026-11-24T10:00:00Z"); // martes 24/11/2026 en Madrid

function app(status: ApplicationStatus, applied_on: string | null, created_at = "2026-01-01T10:00:00Z"): StatsInput {
  return { status, applied_on, created_at };
}

describe("computeStats", () => {
  it("cuenta totales por estado", () => {
    const stats = computeStats(
      [app("guardada", null), app("aplicada", "2026-11-01"), app("aplicada", "2026-11-02"), app("oferta", "2026-10-01")],
      NOW,
    );
    expect(stats.total).toBe(4);
    expect(stats.byStatus).toEqual({ guardada: 1, aplicada: 2, entrevista: 0, oferta: 1, rechazada: 0 });
  });

  it("calcula la tasa de respuesta según SPEC (guardadas no cuentan)", () => {
    const stats = computeStats(
      [
        app("guardada", null),
        app("guardada", null),
        app("aplicada", "2026-11-01"),
        app("entrevista", "2026-11-01"),
        app("oferta", "2026-11-01"),
        app("rechazada", "2026-11-01"),
      ],
      NOW,
    );
    // (1 + 1 + 1) / (1 + 1 + 1 + 1)
    expect(stats.responseRate).toBe(0.75);
  });

  it("sin candidaturas enviadas la tasa es null (sin dividir por 0)", () => {
    expect(computeStats([], NOW).responseRate).toBeNull();
    expect(computeStats([app("guardada", null)], NOW).responseRate).toBeNull();
    expect(computeStats([app("aplicada", "2026-11-01")], NOW).responseRate).toBe(0);
  });

  it("cuenta los últimos 7 días con hoy incluido (18/11 a 24/11)", () => {
    const stats = computeStats(
      [
        app("aplicada", "2026-11-24"), // hoy
        app("aplicada", "2026-11-18"), // límite inferior
        app("aplicada", "2026-11-17"), // fuera
        app("aplicada", "2026-11-25"), // futuro: fuera
        app("guardada", null, "2026-11-20T12:00:00Z"), // sin fecha: usa el alta
        app("guardada", null, "2026-11-17T23:30:00Z"), // 18/11 00:30 en Madrid: dentro
      ],
      NOW,
    );
    expect(stats.last7Days).toBe(4);
  });

  it("devuelve ceros con la lista vacía", () => {
    const stats = computeStats([], NOW);
    expect(stats.total).toBe(0);
    expect(stats.last7Days).toBe(0);
    expect(Object.values(stats.byStatus).every((n) => n === 0)).toBe(true);
  });
});

describe("responseRate / formatPercent", () => {
  it("formatea porcentajes redondeados y el caso sin datos", () => {
    expect(formatPercent(responseRate({ guardada: 0, aplicada: 2, entrevista: 1, oferta: 0, rechazada: 0 }))).toBe("33 %");
    expect(formatPercent(1)).toBe("100 %");
    expect(formatPercent(null)).toBe("—");
  });
});
