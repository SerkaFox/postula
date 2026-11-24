import Link from "next/link";
import { WORK_MODE_LABELS, type Application } from "@/lib/applications";
import { formatDateEs } from "@/lib/dates";
import { DeleteApplicationButton } from "./delete-application-button";
import { StatusSelect } from "./status-select";

const COLUMNS = "md:grid md:grid-cols-[minmax(0,2fr)_9.5rem_6.5rem_minmax(0,1.3fr)_auto] md:items-center md:gap-4";

export function ApplicationList({ applications }: { applications: Application[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div aria-hidden="true" className={`hidden border-b border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-600 ${COLUMNS}`}>
        <span>Empresa y puesto</span>
        <span>Estado</span>
        <span>Fecha</span>
        <span>Detalles</span>
        <span className="text-right">Acciones</span>
      </div>
      <ul className="divide-y divide-zinc-200">
        {applications.map((app) => (
          <ApplicationRow key={app.id} app={app} />
        ))}
      </ul>
    </div>
  );
}

function ApplicationRow({ app }: { app: Application }) {
  const label = `${app.position} en ${app.company}`;
  const date = formatDateEs(app.applied_on);
  const details = [app.work_mode ? WORK_MODE_LABELS[app.work_mode] : null, app.location, app.salary].filter(Boolean).join(" · ");

  return (
    <li className={`flex flex-col gap-3 px-5 py-4 transition hover:bg-zinc-50/70 ${COLUMNS}`}>
      <div className="min-w-0">
        <Link
          href={`/candidaturas/${app.id}`}
          className="block truncate font-semibold text-zinc-900 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {app.company}
        </Link>
        <p className="truncate text-sm text-zinc-600">{app.position}</p>
      </div>

      <div className="flex items-center justify-between gap-3 md:block">
        <div className="w-40 md:w-auto">
          <StatusSelect key={`${app.id}-${app.status}`} id={app.id} status={app.status} label={label} />
        </div>
        <span className="text-sm text-zinc-600 tabular-nums md:hidden">{date || "Sin fecha"}</span>
      </div>

      <span className="hidden text-sm text-zinc-700 tabular-nums md:block">{date || <span className="text-zinc-500">—</span>}</span>

      <div className="min-w-0 text-sm text-zinc-600">
        {details ? <p className="truncate">{details}</p> : <p className="hidden text-zinc-500 md:block">—</p>}
        {app.url ? (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block max-w-full truncate text-indigo-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            Ver oferta<span className="sr-only"> de {label} (se abre en otra pestaña)</span> ↗
          </a>
        ) : null}
      </div>

      <div className="flex flex-wrap items-start gap-1 md:justify-end">
        <Link
          href={`/candidaturas/${app.id}`}
          aria-label={`Editar ${label}`}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Editar
        </Link>
        <DeleteApplicationButton id={app.id} label={label} compact />
      </div>
    </li>
  );
}
