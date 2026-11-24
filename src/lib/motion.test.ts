import { describe, expect, it } from "vitest";
import { easeOutCubic, MAX_STAGGER_MS, staggerDelay, staggerStyle, tweenValue } from "./motion";

describe("staggerDelay", () => {
  it("escalona por índice", () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(2)).toBe(140);
    expect(staggerDelay(3, 100)).toBe(300);
  });

  it("tiene tope y tolera índices raros", () => {
    expect(staggerDelay(50)).toBe(MAX_STAGGER_MS);
    expect(staggerDelay(-3)).toBe(0);
    expect(staggerDelay(Number.NaN)).toBe(0);
  });

  it("devuelve el estilo en línea", () => {
    expect(staggerStyle(1)).toEqual({ animationDelay: "70ms" });
  });
});

describe("easeOutCubic", () => {
  it("va de 0 a 1 y limita fuera de rango", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });
});

describe("tweenValue", () => {
  it("cuenta de 0 al valor final en enteros", () => {
    expect(tweenValue(0, 12, 0)).toBe(0);
    expect(tweenValue(0, 12, 0.5)).toBe(11);
    expect(tweenValue(0, 12, 1)).toBe(12);
    expect(Number.isInteger(tweenValue(0, 7, 0.33))).toBe(true);
  });

  it("también baja (p. ej. al cambiar un estado)", () => {
    expect(tweenValue(5, 3, 0)).toBe(5);
    expect(tweenValue(5, 3, 0.5)).toBe(3);
    expect(tweenValue(5, 3, 1)).toBe(3);
  });

  it("casos límite: progreso fuera de rango y valores no finitos", () => {
    expect(tweenValue(0, 0, 0.5)).toBe(0);
    expect(tweenValue(0, 5, 3)).toBe(5);
    expect(tweenValue(0, 5, -1)).toBe(0);
    expect(tweenValue(Number.NaN, 5, 0.2)).toBe(5);
    expect(tweenValue(0, Number.NaN, 0.5)).toBe(0);
  });
});
