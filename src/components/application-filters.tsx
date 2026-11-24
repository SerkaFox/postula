import Form from "next/form";
import Link from "next/link";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  panelHref,
  type ApplicationFilters as Filters,
  type ApplicationStatus,
} from "@/lib/applications";
import { STATUS_STYLES } from "./status-style";
import { buttonStyles, inputStyles } from "./ui";

type Props = { filters: Filters; counts: Record<ApplicationStatus, number>; total: number };

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      scroll={false}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        active ? "bg-zinc-900 text-white ring-zinc-900" : "bg-white text-zinc-700 ring-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {children}
    </Link>
  );
}

export function ApplicationFilters({ filters, counts, total }: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <nav aria-label="Filtrar por estado">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Chip href={panelHref({ q: filters.q })} active={filters.status === null}>
              Todas <span className="tabular-nums opacity-70">{total}</span>
            </Chip>
          </li>
          {APPLICATION_STATUSES.map((status) => (
            <li key={status}>
              <Chip href={panelHref({ status, q: filters.q })} active={filters.status === status}>
                <span aria-hidden="true" className={`size-2 rounded-full ${STATUS_STYLES[status].dot}`} />
                {STATUS_LABELS[status]} <span className="tabular-nums opacity-70">{counts[status]}</span>
              </Chip>
            </li>
          ))}
        </ul>
      </nav>

      <Form action="/panel" scroll={false} role="search" className="flex w-full gap-2 lg:max-w-sm">
        {filters.status ? <input type="hidden" name="estado" value={filters.status} /> : null}
        <label htmlFor="q" className="sr-only">
          Buscar por empresa o puesto
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.q}
          key={filters.q}
          maxLength={100}
          placeholder="Buscar empresa o puesto…"
          className={`${inputStyles} border-zinc-300 py-1.5 text-sm`}
        />
        <button type="submit" className={`${buttonStyles.secondary} py-1.5`}>
          Buscar
        </button>
      </Form>
    </div>
  );
}
