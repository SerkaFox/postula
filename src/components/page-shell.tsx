import Link from "next/link";
import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

/** Estructura de las páginas de formulario: cabecera, volver y tarjeta. */
export function FormPageShell({ email, title, subtitle, children }: { email: string; title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <>
      <AppHeader email={email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          href="/panel"
          className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-zinc-600 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span aria-hidden="true">←</span> Volver al panel
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-zinc-600">{subtitle}</p> : null}
        <div className="mt-6 flex flex-col gap-6">{children}</div>
      </main>
    </>
  );
}

export function FormPageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-3xl px-4 py-8">
      <span className="sr-only">{label}</span>
      <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 h-8 w-64 animate-pulse rounded bg-zinc-200" />
      <div className="mt-6 h-[32rem] animate-pulse rounded-2xl bg-zinc-200" />
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">{children}</div>;
}
