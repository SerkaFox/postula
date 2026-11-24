"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, loginSchema, signupSchema } from "@/lib/validation";

export type AuthFormState = {
  fieldErrors?: Partial<Record<"email" | "password" | "confirmPassword", string>>;
  formError?: string;
  email?: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = { email: readString(formData, "email"), password: readString(formData, "password") };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), email: raw.email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { formError: authErrorMessage(error), email: parsed.data.email };
  }
  redirect("/panel");
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    email: readString(formData, "email"),
    password: readString(formData, "password"),
    confirmPassword: readString(formData, "confirmPassword"),
  };
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), email: raw.email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { formError: authErrorMessage(error), email: parsed.data.email };
  }
  // Con confirmación de email activada no hay sesión; con email ya registrado
  // Supabase devuelve un usuario sin identidades.
  if (!data.session) {
    if (data.user && data.user.identities?.length === 0) {
      return { formError: "Ya existe una cuenta con ese email.", email: parsed.data.email };
    }
    return { formError: "Revisa tu correo para confirmar la cuenta y después entra.", email: parsed.data.email };
  }
  redirect("/panel");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
