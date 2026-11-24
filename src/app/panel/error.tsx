"use client";

import { buttonStyles } from "@/components/ui";

export default function PanelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">No se ha podido cargar el panel</h1>
      <p className="mt-2 text-sm text-zinc-600">Ha ocurrido un error. Vuelve a intentarlo en unos segundos.</p>
      <button
        type="button"
        onClick={reset}
        className={`${buttonStyles.primary} mt-4`}
      >
        Reintentar
      </button>
    </main>
  );
}
