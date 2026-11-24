"use client";

export default function PanelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">No se ha podido cargar el panel</h1>
      <p className="mt-2 text-sm text-zinc-600">Ha ocurrido un error. Vuelve a intentarlo en unos segundos.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Reintentar
      </button>
    </main>
  );
}
