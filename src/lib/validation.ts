import { z } from "zod";
import { APPLICATION_STATUSES, WORK_MODES } from "./applications";
import { isValidDayKey } from "./dates";

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

/** Texto opcional: recorta espacios y guarda null si queda vacío. */
function optionalText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => (value === "" ? null : value));
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Indica la empresa.").max(200, "Máximo 200 caracteres."),
  position: z.string().trim().min(1, "Indica el puesto.").max(200, "Máximo 200 caracteres."),
  url: optionalText(2000, "El enlace es demasiado largo.").refine(
    (value) => value === null || isHttpUrl(value),
    "Introduce un enlace válido que empiece por http:// o https://.",
  ),
  location: optionalText(200, "Máximo 200 caracteres."),
  work_mode: z
    .union([z.enum(WORK_MODES), z.literal("")], { error: "Elige una modalidad válida." })
    .transform((value) => (value === "" ? null : value)),
  salary: optionalText(200, "Máximo 200 caracteres."),
  status: z.enum(APPLICATION_STATUSES, { error: "Elige un estado válido." }),
  applied_on: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidDayKey(value), "Introduce una fecha válida.")
    .transform((value) => (value === "" ? null : value)),
  notes: optionalText(5000, "Las notas no pueden superar 5000 caracteres."),
});

export const applicationIdSchema = z.uuid("Candidatura no válida.");

export const statusChangeSchema = z.object({
  id: applicationIdSchema,
  status: z.enum(APPLICATION_STATUSES, { error: "Elige un estado válido." }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationField = keyof z.input<typeof applicationSchema>;
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
