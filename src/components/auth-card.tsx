import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgb(224_231_255/0.8),transparent)]" />
      <div className="grid w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-indigo-100/70 animate-fade-up md:max-w-4xl md:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-8 md:flex">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Tu búsqueda, ordenada</p>
            <p className="mt-2 max-w-xs text-sm text-zinc-600">Cada candidatura con su estado, tus notas y tus cifras. Solo tú ves tus datos.</p>
          </div>
          <Image
            src="/illustrations/auth.webp"
            alt="Ilustración de un portátil con tarjetas de colores protegido por un candado y un escudo"
            width={675}
            height={900}
            sizes="(min-width: 768px) 360px, 0px"
            className="mx-auto mt-6 h-auto w-full max-w-[20rem] rounded-2xl shadow-lg shadow-indigo-100"
          />
        </div>
        <div className="p-6 sm:p-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-md text-xl font-bold tracking-tight text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
              P
            </span>
            Postula
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-zinc-600">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
