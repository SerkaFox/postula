import { describe, expect, it } from "vitest";
import { isAuthPath, isPrivatePath } from "./proxy";

describe("isPrivatePath", () => {
  it("marca como privadas /panel y /candidaturas con subrutas", () => {
    expect(isPrivatePath("/panel")).toBe(true);
    expect(isPrivatePath("/candidaturas/nueva")).toBe(true);
    expect(isPrivatePath("/candidaturas/123")).toBe(true);
  });

  it("no marca rutas públicas ni prefijos parecidos", () => {
    expect(isPrivatePath("/")).toBe(false);
    expect(isPrivatePath("/login")).toBe(false);
    expect(isPrivatePath("/panelx")).toBe(false);
  });
});

describe("isAuthPath", () => {
  it("reconoce /login y /registro, y nada más", () => {
    expect(isAuthPath("/login")).toBe(true);
    expect(isAuthPath("/registro")).toBe(true);
    expect(isAuthPath("/login/otra")).toBe(false);
    expect(isAuthPath("/panel")).toBe(false);
  });
});
