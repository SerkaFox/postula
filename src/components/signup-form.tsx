"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthFormState } from "@/app/actions/auth";
import { FormField } from "./form-field";
import { FormAlert, SubmitButton } from "./form-parts";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);
  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormAlert message={state.formError} />
      <FormField id="email" label="Email" type="email" autoComplete="email" defaultValue={state.email} error={state.fieldErrors?.email} required />
      <FormField
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
        error={state.fieldErrors?.password}
        required
      />
      <FormField
        id="confirmPassword"
        label="Repite la contraseña"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        required
      />
      <SubmitButton pending={pending} label="Crear cuenta" pendingLabel="Creando cuenta…" />
      <p className="text-center text-sm text-zinc-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-indigo-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-500">
          Entra
        </Link>
      </p>
    </form>
  );
}
