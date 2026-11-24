import Link from "next/link";
import { Logo } from "@/components/logo";
import { StatusBadge } from "@/components/status-badge";
import { buttonStyles } from "@/components/ui";
import type { ApplicationStatus } from "@/lib/applications";

const REPO_URL = "https://github.com/SerkaFox/postula";

const FEATURES = [
  {
    title: "Todas tus candidaturas en un sitio",
    text: "Empresa, puesto, enlace, modalidad, salario y notas. Se acabó buscar en el correo a qué te apuntaste.",
  },
  {
    title: "Estados claros",
    text: "Guardada, aplicada, entrevista, oferta o rechazada. Cambia el estado desde la lista con un clic.",
  },
  {
    title: "Tu búsqueda en cifras",
    text: "Totales por estado, tasa de respuesta y candidaturas de los últimos 7 días, siempre al día.",
  },
  {
    title: "Privado por diseño",
    text: "Cada usuario ve solo sus datos: lo garantiza la base de datos con políticas de seguridad por fila.",
  },
];

const AGENTS = [
  { name: "Orquestador", text: "Divide el trabajo en tareas con criterios de aceptación y decide cuándo una está terminada." },
  { name: "Develop", text: "Programa cada tarea siguiendo las directrices del proyecto y entrega con instrucciones para probarla." },
  { name: "Testing", text: "Revisa cada entrega contra las directrices, prueba la app y devuelve los fallos hasta que pasa." },
];

const PREVIEW: { company: string; position: string; status: ApplicationStatus }[] = [
  { company: "Nubia Labs", position: "Frontend Developer", status: "entrevista" },
  { company: "Hexa Pagos", position: "Full Stack Engineer", status: "aplicada" },
  { company: "Mareo Studio", position: "React Developer", status: "oferta" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Logo />
        <nav aria-label="Cuenta" className="flex items-center gap-2">
          <Link href="/login" className={buttonStyles.ghost}>
            Entrar
          </Link>
          <Link href="/registro" className={`${buttonStyles.primary} hidden sm:inline-flex`}>
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-10 lg:grid-cols-2 lg:pt-16">
          <div>
            <p className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
              Seguimiento de candidaturas
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Tu búsqueda de empleo, <span className="text-indigo-600">bajo control</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600">
              Postula guarda las ofertas a las que te apuntas, su estado y tus notas, y te enseña cómo va tu búsqueda: cuántas te responden y cuánto
              has avanzado esta semana.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/registro" className={`${buttonStyles.primary} px-6 py-3 text-base`}>
                Crear cuenta gratis
              </Link>
              <Link href="/login" className={`${buttonStyles.secondary} px-6 py-3 text-base`}>
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl shadow-indigo-100 sm:p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["12", "Candidaturas"],
                ["58 %", "Respuesta"],
                ["4", "Esta semana"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-zinc-50 p-3">
                  <p className="text-xl font-semibold text-zinc-900 sm:text-2xl">{value}</p>
                  <p className="text-xs text-zinc-600">{label}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 divide-y divide-zinc-100">
              {PREVIEW.map((item) => (
                <li key={item.company} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">{item.company}</p>
                    <p className="truncate text-sm text-zinc-600">{item.position}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="funciones" className="border-y border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <h2 id="funciones" className="text-2xl font-semibold tracking-tight text-zinc-900">
              Lo que necesitas, nada más
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="rounded-2xl border border-zinc-200 p-5">
                  <h3 className="font-semibold text-zinc-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{feature.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="equipo" className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 id="equipo" className="text-2xl font-semibold tracking-tight text-zinc-900">
            Hecho por un equipo de 3 agentes de IA
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Postula se ha construido con un flujo de trabajo de agentes: cada uno tiene un papel, unas reglas escritas y revisa o es revisado por los demás.
          </p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {AGENTS.map((agent, index) => (
              <li key={agent.name} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <span className="grid size-8 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">{index + 1}</span>
                <h3 className="mt-3 font-semibold text-zinc-900">{agent.name}</h3>
                <p className="mt-1 text-sm text-zinc-600">{agent.text}</p>
              </li>
            ))}
          </ol>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonStyles.secondary} mt-8`}
          >
            Ver el código en GitHub<span className="sr-only"> (se abre en otra pestaña)</span> ↗
          </a>
        </section>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-zinc-600 sm:flex-row sm:justify-between">
          <p>Postula · Next.js, Supabase y Tailwind CSS</p>
          <a href={REPO_URL} className="underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600">
            github.com/SerkaFox/postula
          </a>
        </div>
      </footer>
    </div>
  );
}
