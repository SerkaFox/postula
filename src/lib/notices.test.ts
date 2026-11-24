import { describe, expect, it } from "vitest";
import { isNoticeKey } from "./notices";

describe("isNoticeKey", () => {
  it("acepta los avisos conocidos", () => {
    expect(isNoticeKey("creada")).toBe(true);
    expect(isNoticeKey("guardada")).toBe(true);
    expect(isNoticeKey("borrada")).toBe(true);
  });

  it("rechaza claves heredadas de Object y valores no válidos", () => {
    for (const value of ["__proto__", "toString", "constructor", "hasOwnProperty", "valueOf", "", "otra"]) {
      expect(isNoticeKey(value)).toBe(false);
    }
    expect(isNoticeKey(undefined)).toBe(false);
    expect(isNoticeKey(["creada"])).toBe(false);
  });
});
