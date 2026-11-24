import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { StatusBadge } from "@/components/status-badge";
import { buttonStyles, cardStyles } from "@/components/ui";
import { staggerStyle } from "@/lib/motion";

const REPO_URL = "https://github.com/SerkaFox/postula";

/** Iconos de línea (24×24, trazo con currentColor). */
const ICONS = {
  stack: (
    <>
      <rect x="4" y="4" width="16" height="6" rx="2" />
      <rect x="4" y="14" width="16" height="6" rx="2" />
    </>
  ),
  status: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.3 11 15.7 7M8.3 13l7.4 4" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6L12 3Z" />
      <path d="m8.8 12.2 2.2 2.2 4.3-4.4" />
    </>
  ),
} satisfies Record<string, ReactNode>;

const FEATURES = [
  {
    icon: "stack",
    tone: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    title: "Todas tus candidaturas en un sitio",
    text: "Empresa, puesto, enlace, modalidad, salario y notas. Se acabó buscar en el correo a qué te apuntaste.",
  },
  {
    icon: "status",
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
    title: "Estados claros",
    text: "Guardada, aplicada, entrevista, oferta o rechazada. Cambia el estado desde la lista con un clic.",
  },
  {
    icon: "chart",
    tone: "bg-sky-50 text-sky-600 ring-sky-100",
    title: "Tu búsqueda en cifras",
    text: "Totales por estado, tasa de respuesta y candidaturas de los últimos 7 días, siempre al día.",
  },
  {
    icon: "shield",
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    title: "Privado por diseño",
    text: "Cada usuario ve solo sus datos: lo garantiza la base de datos con políticas de seguridad por fila.",
  },
] as const;

const AGENTS = [
  {
    name: "Orquestador",
    color: "bg-indigo-600",
    text: "Divide el trabajo en tareas con criterios de aceptación y decide cuándo una está terminada.",
  },
  { name: "Develop", color: "bg-sky-600", text: "Programa cada tarea siguiendo las directrices del proyecto y entrega con instrucciones para probarla." },
  { name: "Testing", color: "bg-emerald-600", text: "Revisa cada entrega contra las directrices, prueba la app y devuelve los fallos hasta que pasa." },
];

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      {ICONS[name]}
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip">
      {/* Acentos de color de fondo (decorativos). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem]">
        <div className="absolute -left-32 -top-40 size-[32rem] rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute -right-24 top-10 size-[26rem] rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute left-1/3 top-72 size-[22rem] rounded-full bg-violet-200/40 blur-3xl" />
      </div>

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
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:pt-14">
          <div>
            <p
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-200 animate-fade-up"
              style={staggerStyle(0)}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-indigo-500" />
              Seguimiento de candidaturas
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-zinc-900 animate-fade-up sm:text-5xl lg:text-6xl" style={staggerStyle(1)}>
              Tu búsqueda de empleo,{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">bajo control</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-zinc-600 animate-fade-up" style={staggerStyle(2)}>
              Postula guarda las ofertas a las que te apuntas, su estado y tus notas, y te enseña cómo va tu búsqueda: cuántas te responden y cuánto
              has avanzado esta semana.
            </p>
            <div className="mt-8 flex flex-col gap-3 animate-fade-up sm:flex-row" style={staggerStyle(3)}>
              <Link href="/registro" className={`${buttonStyles.primary} px-6 py-3 text-base`}>
                Crear cuenta gratis
              </Link>
              <Link href="/login" className={`${buttonStyles.secondary} px-6 py-3 text-base`}>
                Ya tengo cuenta
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-600 animate-fade-up" style={staggerStyle(4)}>
              Gratis, sin tarjeta. Tus datos solo los ves tú.
            </p>
          </div>

          <div className="relative animate-fade-in" style={staggerStyle(2)}>
            <div className="animate-float">
              <Image
                src="/illustrations/hero.webp"
                alt="Tarjetas de ofertas de empleo flotando con etiquetas de estado de colores y un avión de papel"
                width={1600}
                height={900}
                preload
                sizes="(min-width: 1152px) 600px, (min-width: 1024px) 52vw, 100vw"
                className="h-auto w-full rounded-3xl"
              />
            </div>
            {/* Mini resumen decorativo sobre la ilustración. */}
            <div
              aria-hidden="true"
              className="absolute -bottom-6 left-4 hidden w-64 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-xl shadow-indigo-200/50 backdrop-blur animate-fade-up sm:block"
              style={staggerStyle(5)}
            >
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium text-zinc-600">Tasa de respuesta</p>
                <p className="text-lg font-semibold text-zinc-900 tabular-nums">58 %</p>
              </div>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div className="w-[30%] bg-sky-500" />
                <div className="w-[25%] bg-amber-500" />
                <div className="w-[15%] bg-emerald-500" />
                <div className="w-[18%] bg-rose-500" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusBadge status="entrevista" />
                <StatusBadge status="oferta" />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="funciones" className="border-y border-zinc-200/80 bg-white/70">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Funciones</p>
            <h2 id="funciones" className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Lo que necesitas, nada más
            </h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <li key={feature.title} className={`${cardStyles.interactive} p-6 animate-fade-up`} style={staggerStyle(index + 3)}>
                  <span className={`grid size-10 place-items-center rounded-xl ring-1 ring-inset ${feature.tone}`}>
                    <Icon name={feature.icon} />
                  </span>
                  <h3 className="mt-4 font-semibold text-zinc-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{feature.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="equipo" className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Cómo se hizo</p>
            <h2 id="equipo" className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Hecho por un equipo de 3 agentes de IA
            </h2>
            <p className="mt-3 max-w-xl text-zinc-600">
              Postula se ha construido con un flujo de trabajo de agentes: cada uno tiene un papel, unas reglas escritas y revisa o es revisado por los
              demás.
            </p>
            <ol className="mt-8 flex flex-col gap-4">
              {AGENTS.map((agent, index) => (
                <li key={agent.name} className={`${cardStyles.interactive} flex gap-4 p-4 animate-fade-up`} style={staggerStyle(index + 4)}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${agent.color}`}>{index + 1}</span>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{agent.name}</h3>
                    <p className="mt-0.5 text-sm text-zinc-600">{agent.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={`${buttonStyles.secondary} mt-8`}>
              Ver el código en GitHub<span className="sr-only"> (se abre en otra pestaña)</span> ↗
            </a>
          </div>
          <div className="order-1 lg:order-2">
            <Image
              src="/illustrations/agents.webp"
              alt="Tres robots trabajan en bucle alrededor de una ventana de código: uno organiza con un portapapeles, otro programa y otro revisa con una lupa"
              width={1400}
              height={788}
              sizes="(min-width: 1152px) 540px, (min-width: 1024px) 46vw, 100vw"
              className="h-auto w-full rounded-3xl border border-zinc-200 bg-white shadow-lg shadow-indigo-100/60"
            />
          </div>
        </section>

        <section aria-labelledby="empieza" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-10 text-center shadow-xl shadow-indigo-200 sm:px-10">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
            <h2 id="empieza" className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Empieza a ordenar tu búsqueda hoy
            </h2>
            <p className="relative mx-auto mt-2 max-w-lg text-indigo-100">Crea tu cuenta en un minuto y añade tu primera candidatura.</p>
            <Link
              href="/registro"
              className="relative mt-6 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:hover:-translate-y-px"
            >
              Empezar ahora
            </Link>
          </div>
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
