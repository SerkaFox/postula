import { describe, expect, it } from "vitest";
import { applicationSchema, fieldErrors, loginSchema, signupSchema, statusChangeSchema } from "./validation";

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

describe("applicationSchema", () => {
  const base = {
    company: " Acme ",
    position: "Dev",
    url: "",
    location: "",
    work_mode: "",
    salary: "",
    status: "aplicada",
    applied_on: "",
    notes: "",
  };

  it("acepta lo mínimo y convierte los opcionales vacíos en null", () => {
    const result = applicationSchema.safeParse(base);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      company: "Acme",
      position: "Dev",
      url: null,
      location: null,
      work_mode: null,
      salary: null,
      status: "aplicada",
      applied_on: null,
      notes: null,
    });
  });

  it("acepta todos los campos válidos", () => {
    const result = applicationSchema.safeParse({
      ...base,
      url: "https://empleo.example.com/oferta/1",
      work_mode: "hibrido",
      applied_on: "2026-11-24",
      notes: "Contacto: Ana",
    });
    expect(result.success).toBe(true);
    expect(result.data?.work_mode).toBe("hibrido");
  });

  it("exige empresa y puesto y valida estado, modalidad, enlace y fecha", () => {
    const result = applicationSchema.safeParse({
      ...base,
      company: "  ",
      position: "",
      status: "inventado",
      work_mode: "marte",
      url: "javascript:alert(1)",
      applied_on: "2026-02-30",
    });
    expect(result.success).toBe(false);
    const errors = fieldErrors(result.error!);
    expect(errors).toMatchObject({
      company: "Indica la empresa.",
      position: "Indica el puesto.",
      status: "Elige un estado válido.",
      work_mode: "Elige una modalidad válida.",
      applied_on: "Introduce una fecha válida.",
    });
    expect(errors.url).toMatch(/http/);
  });

  it("respeta los límites de longitud (200 pasa, 201 falla)", () => {
    expect(applicationSchema.safeParse({ ...base, company: "a".repeat(200) }).success).toBe(true);
    expect(applicationSchema.safeParse({ ...base, company: "a".repeat(201) }).success).toBe(false);
  });
});

describe("statusChangeSchema", () => {
  it("exige un uuid y un estado válido", () => {
    expect(statusChangeSchema.safeParse({ id: "6f1c2a9e-3b4d-4e5f-8a7b-1c2d3e4f5a6b", status: "oferta" }).success).toBe(true);
    expect(statusChangeSchema.safeParse({ id: "1", status: "oferta" }).success).toBe(false);
    expect(statusChangeSchema.safeParse({ id: "6f1c2a9e-3b4d-4e5f-8a7b-1c2d3e4f5a6b", status: "x" }).success).toBe(false);
  });
});
