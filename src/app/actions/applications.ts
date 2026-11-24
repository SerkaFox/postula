"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  applicationIdSchema,
  applicationSchema,
  fieldErrors,
  statusChangeSchema,
  type ApplicationField,
} from "@/lib/validation";

export type ApplicationFormState = {
  fieldErrors?: Partial<Record<ApplicationField, string>>;
  formError?: string;
  /** Lo que escribió el usuario, para no perderlo si hay errores. */
  values?: Partial<Record<ApplicationField, string>>;
};

export type ActionResult = { error?: string };

const FIELDS: readonly ApplicationField[] = [
  "company",
  "position",
  "url",
  "location",
  "work_mode",
  "salary",
  "status",
  "applied_on",
  "notes",
];

function readFields(formData: FormData): Record<ApplicationField, string> {
  const entries = FIELDS.map((field) => {
    const value = formData.get(field);
    return [field, typeof value === "string" ? value : ""] as const;
  });
  return Object.fromEntries(entries) as Record<ApplicationField, string>;
}

async function requireActionUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

const SAVE_ERROR = "No se ha podido guardar la candidatura. Inténtalo de nuevo.";

export async function createApplication(
  _prev: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const user = await requireActionUser();
  const raw = readFields(formData);
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: raw };

  const supabase = await createClient();
  const { error } = await supabase.from("applications").insert({ ...parsed.data, user_id: user.id });
  if (error) return { formError: SAVE_ERROR, values: raw };

  revalidatePath("/panel");
  redirect("/panel?aviso=creada");
}

export async function updateApplication(
  _prev: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const user = await requireActionUser();
  const raw = readFields(formData);
  const id = applicationIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { formError: "Candidatura no válida.", values: raw };
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: raw };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update(parsed.data)
    .eq("id", id.data)
    .eq("user_id", user.id)
    .select("id");
  if (error) return { formError: SAVE_ERROR, values: raw };
  if (!data?.length) return { formError: "Esta candidatura ya no existe.", values: raw };

  revalidatePath("/panel");
  revalidatePath(`/candidaturas/${id.data}`);
  redirect("/panel?aviso=guardada");
}

/** Cambio rápido de estado desde la lista. */
export async function updateApplicationStatus(id: string, status: string): Promise<ActionResult> {
  const user = await requireActionUser();
  const parsed = statusChangeSchema.safeParse({ id, status });
  if (!parsed.success) return { error: "Estado no válido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select("id");
  if (error) return { error: "No se ha podido cambiar el estado." };
  if (!data?.length) return { error: "Esta candidatura ya no existe." };

  revalidatePath("/panel");
  return {};
}

const deleteSchema = z.object({ id: applicationIdSchema, goToPanel: z.boolean() });

/** Borra una candidatura. Con `goToPanel` vuelve al panel (se usa desde la edición). */
export async function deleteApplication(id: string, goToPanel: boolean): Promise<ActionResult> {
  const user = await requireActionUser();
  const parsed = deleteSchema.safeParse({ id, goToPanel });
  if (!parsed.success) return { error: "Candidatura no válida." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select("id");
  if (error) return { error: "No se ha podido borrar la candidatura." };
  if (!data?.length) return { error: "Esta candidatura ya no existe." };

  revalidatePath("/panel");
  if (parsed.data.goToPanel) redirect("/panel?aviso=borrada");
  return {};
}
