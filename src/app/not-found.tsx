import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonStyles } from "@/components/ui";

export const metadata: Metadata = { title: "Página no encontrada · Postula" };

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <Logo />
      <p className="mt-10 text-sm font-semibold text-indigo-700">Error 404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-zinc-600">
        La página o la candidatura que buscas no existe, se ha borrado o no es tuya.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/panel" className={buttonStyles.primary}>
          Ir a mi panel
        </Link>
        <Link href="/" className={buttonStyles.secondary}>
          Volver a la portada
        </Link>
      </div>
    </main>
  );
}
