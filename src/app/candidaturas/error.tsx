"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui";

export default function ApplicationError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">No se ha podido cargar la candidatura</h1>
      <p className="mt-2 text-sm text-zinc-600">Ha ocurrido un error. Vuelve a intentarlo en unos segundos.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className={buttonStyles.primary}
        >
          Reintentar
        </button>
        <Link
          href="/panel"
          className={buttonStyles.secondary}
        >
          Volver al panel
        </Link>
      </div>
    </main>
  );
}
