"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthFormState } from "@/app/actions/auth";
import { FormField } from "./form-field";
import { FormAlert, SubmitButton } from "./form-parts";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormAlert message={state.formError} />
      <FormField id="email" label="Email" type="email" autoComplete="email" defaultValue={state.email} error={state.fieldErrors?.email} required />
      <FormField id="password" label="Contraseña" type="password" autoComplete="current-password" error={state.fieldErrors?.password} required />
      <SubmitButton pending={pending} label="Entrar" pendingLabel="Entrando…" />
      <p className="text-center text-sm text-zinc-600">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-indigo-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-500">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
