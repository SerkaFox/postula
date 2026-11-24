import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-indigo-700">Postula</h1>
      <p className="mt-4 max-w-md text-lg text-zinc-700">
        Guarda las ofertas a las que te apuntas, su estado y tus notas, y mira cómo va tu búsqueda de empleo.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          href="/registro"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Crear cuenta
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 font-medium text-zinc-800 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
