import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./auth-errors";

describe("authErrorMessage", () => {
  it("traduce credenciales inválidas por código o por mensaje", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe("Email o contraseña incorrectos.");
    expect(authErrorMessage({ message: "Invalid login credentials" })).toBe("Email o contraseña incorrectos.");
  });

  it("traduce usuario ya existente", () => {
    expect(authErrorMessage({ code: "user_already_exists" })).toBe("Ya existe una cuenta con ese email.");
  });

  it("devuelve un mensaje genérico para errores desconocidos, nulos o vacíos", () => {
    const generic = "No se ha podido completar la operación. Inténtalo de nuevo.";
    expect(authErrorMessage({ code: "otro", message: "boom" })).toBe(generic);
    expect(authErrorMessage(null)).toBe(generic);
    expect(authErrorMessage({})).toBe(generic);
  });
});
