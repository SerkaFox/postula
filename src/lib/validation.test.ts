import { describe, expect, it } from "vitest";
import { fieldErrors, loginSchema, signupSchema } from "./validation";

describe("loginSchema", () => {
  it("acepta email y contraseña válidos y recorta espacios del email", () => {
    const result = loginSchema.safeParse({ email: "  ana@example.com ", password: "x" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("ana@example.com");
  });

  it("rechaza email vacío o mal formado", () => {
    const empty = loginSchema.safeParse({ email: "", password: "x" });
    expect(empty.success).toBe(false);
    expect(fieldErrors(empty.error!).email).toBe("Introduce tu email.");

    const bad = loginSchema.safeParse({ email: "no-es-email", password: "x" });
    expect(fieldErrors(bad.error!).email).toBe("Introduce un email válido.");
  });

  it("rechaza contraseña vacía", () => {
    const result = loginSchema.safeParse({ email: "ana@example.com", password: "" });
    expect(fieldErrors(result.error!).password).toBe("Introduce tu contraseña.");
  });
});

describe("signupSchema", () => {
  it("acepta datos válidos", () => {
    const result = signupSchema.safeParse({
      email: "ana@example.com",
      password: "12345678",
      confirmPassword: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("exige mínimo 8 caracteres (7 falla, 8 pasa)", () => {
    const short = signupSchema.safeParse({
      email: "ana@example.com",
      password: "1234567",
      confirmPassword: "1234567",
    });
    expect(fieldErrors(short.error!).password).toMatch(/al menos 8/);
  });

  it("rechaza contraseñas que no coinciden en el campo de confirmación", () => {
    const result = signupSchema.safeParse({
      email: "ana@example.com",
      password: "12345678",
      confirmPassword: "87654321",
    });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!)).toEqual({ confirmPassword: "Las contraseñas no coinciden." });
  });

  it("rechaza contraseñas de más de 72 caracteres", () => {
    const long = "a".repeat(73);
    const result = signupSchema.safeParse({ email: "ana@example.com", password: long, confirmPassword: long });
    expect(fieldErrors(result.error!).password).toMatch(/72/);
  });
});

describe("fieldErrors", () => {
  it("devuelve solo el primer error de cada campo", () => {
    const result = signupSchema.safeParse({ email: "", password: "", confirmPassword: "" });
    const errors = fieldErrors(result.error!);
    expect(errors.email).toBe("Introduce tu email.");
    expect(errors.password).toMatch(/al menos 8/);
    expect(errors.confirmPassword).toBe("Repite la contraseña.");
  });
});
