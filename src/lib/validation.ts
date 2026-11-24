import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Introduce tu email.")
  .max(254, "El email es demasiado largo.")
  .pipe(z.email("Introduce un email válido."));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Introduce tu contraseña.").max(72, "La contraseña es demasiado larga."),
});

export const signupSchema = z
  .object({
    email,
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(72, "La contraseña no puede superar 72 caracteres."),
    confirmPassword: z.string().min(1, "Repite la contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

/** Primer mensaje de error de cada campo, listo para mostrar junto al campo. */
export function fieldErrors<T extends Record<string, unknown>>(
  error: z.ZodError<T>,
): Partial<Record<keyof T & string, string>> {
  const result: Partial<Record<keyof T & string, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key as keyof T & string] = issue.message;
    }
  }
  return result;
}
