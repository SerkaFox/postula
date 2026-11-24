import { describe, expect, it } from "vitest";
import { addDays, formatDateEs, isValidDayKey, toDayKey } from "./dates";

describe("formatDateEs", () => {
  it("muestra un día aaaa-mm-dd como dd/mm/aaaa", () => {
    expect(formatDateEs("2026-03-05")).toBe("05/03/2026");
  });

  it("convierte un timestamptz UTC al día de Madrid", () => {
    // 23:30 UTC del 31/12 ya es 1 de enero en Madrid (UTC+1).
    expect(formatDateEs("2025-12-31T23:30:00+00:00")).toBe("01/01/2026");
    expect(formatDateEs("2025-12-31T23:30:00Z", "UTC")).toBe("31/12/2025");
  });

  it("devuelve cadena vacía con null, vacío o fechas imposibles", () => {
    expect(formatDateEs(null)).toBe("");
    expect(formatDateEs("")).toBe("");
    expect(formatDateEs("2026-02-30")).toBe("");
    expect(formatDateEs("no es fecha")).toBe("");
  });
});

describe("toDayKey / addDays / isValidDayKey", () => {
  it("calcula el día en la zona indicada", () => {
    const instant = new Date("2026-06-30T22:30:00Z"); // 00:30 del 1/7 en Madrid (UTC+2)
    expect(toDayKey(instant)).toBe("2026-07-01");
    expect(toDayKey(instant, "UTC")).toBe("2026-06-30");
  });

  it("suma y resta días cruzando meses, años y cambio de hora", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-29", -6)).toBe("2026-03-23");
    expect(() => addDays("31/12/2026", 1)).toThrow();
  });

  it("valida fechas reales del calendario", () => {
    expect(isValidDayKey("2024-02-29")).toBe(true);
    expect(isValidDayKey("2025-02-29")).toBe(false);
    expect(isValidDayKey("2025-13-01")).toBe(false);
    expect(isValidDayKey("2025-1-01")).toBe(false);
  });
});
