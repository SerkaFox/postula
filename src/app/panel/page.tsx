import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Panel · Postula" };

export default function PanelPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Panel />
    </Suspense>
  );
}

async function Panel() {
  // Comprobación en servidor: sin sesión redirige a /login.
  const user = await requireUser();
  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Tu panel</h1>
        <section className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-medium text-zinc-800">Aún no tienes candidaturas.</p>
          <p className="mt-1 text-sm text-zinc-600">Pronto podrás añadir las ofertas a las que te apuntes.</p>
        </section>
      </main>
    </>
  );
}

function PanelSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-5xl px-4 py-8">
      <span className="sr-only">Cargando tu panel…</span>
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
      <div className="mt-6 h-32 animate-pulse rounded-2xl bg-zinc-200" />
    </div>
  );
}
