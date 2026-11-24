import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/applications";
import { formatPercent, type ApplicationStats } from "@/lib/stats";
import { STATUS_STYLES } from "./status-style";

function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <dt className="text-sm font-medium text-zinc-600">{label}</dt>
      <dd className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">{value}</dd>
      <dd className="mt-1 text-sm text-zinc-600">{detail}</dd>
    </div>
  );
}

export function StatsOverview({ stats }: { stats: ApplicationStats }) {
  const { byStatus } = stats;
  const sent = byStatus.aplicada + byStatus.entrevista + byStatus.oferta + byStatus.rechazada;
  const responded = sent - byStatus.aplicada;

  return (
    <section aria-labelledby="resumen" className="flex flex-col gap-4">
      <h2 id="resumen" className="sr-only">
        Resumen
      </h2>
      <dl className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Candidaturas" value={String(stats.total)} detail={stats.total === 1 ? "1 en seguimiento" : `${stats.total} en seguimiento`} />
        <Kpi
          label="Tasa de respuesta"
          value={formatPercent(stats.responseRate)}
          detail={sent === 0 ? "Aún no has enviado ninguna" : `${responded} de ${sent} enviadas con respuesta`}
        />
        <Kpi label="Últimos 7 días" value={String(stats.last7Days)} detail="con fecha en la última semana, hoy incluido" />
      </dl>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-medium text-zinc-600">Por estado</h3>
        {stats.total > 0 ? (
          <div aria-hidden="true" className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-zinc-100">
            {APPLICATION_STATUSES.map((status) =>
              byStatus[status] > 0 ? (
                <div key={status} className={STATUS_STYLES[status].bar} style={{ width: `${(byStatus[status] / stats.total) * 100}%` }} />
              ) : null,
            )}
          </div>
        ) : null}
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {APPLICATION_STATUSES.map((status) => (
            <li key={status} className="flex items-center gap-2">
              <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${STATUS_STYLES[status].dot}`} />
              <span className="text-sm text-zinc-700">{STATUS_LABELS[status]}</span>
              <span className="ml-auto text-sm font-semibold text-zinc-900 tabular-nums sm:ml-1">{byStatus[status]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
