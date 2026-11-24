import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from "./applications";
import { addDays, APP_TIME_ZONE, toDayKey } from "./dates";

export type StatsInput = Pick<Application, "status" | "applied_on" | "created_at">;

export type ApplicationStats = {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  /** Respuestas / candidaturas enviadas, entre 0 y 1; null si aún no se ha enviado ninguna. */
  responseRate: number | null;
  /** Candidaturas cuya fecha (de candidatura o, si falta, de alta) cae en los últimos 7 días, hoy incluido. */
  last7Days: number;
};

const RESPONDED: readonly ApplicationStatus[] = ["entrevista", "oferta", "rechazada"];
const SENT: readonly ApplicationStatus[] = ["aplicada", ...RESPONDED];

export function emptyStatusCounts(): Record<ApplicationStatus, number> {
  return Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
}

/**
 * Tasa de respuesta según SPEC:
 * (entrevista + oferta + rechazada) / (aplicada + entrevista + oferta + rechazada).
 */
export function responseRate(byStatus: Record<ApplicationStatus, number>): number | null {
  const sent = SENT.reduce((sum, s) => sum + byStatus[s], 0);
  if (sent === 0) return null;
  const responded = RESPONDED.reduce((sum, s) => sum + byStatus[s], 0);
  return responded / sent;
}

/** Día de referencia de una candidatura: su fecha de candidatura o, si no tiene, el día de alta. */
export function applicationDay(app: Pick<Application, "applied_on" | "created_at">, timeZone = APP_TIME_ZONE): string {
  return app.applied_on ?? toDayKey(new Date(app.created_at), timeZone);
}

/** Calcula las cifras del panel. `now` se inyecta para poder probarlo. */
export function computeStats(
  applications: readonly StatsInput[],
  now: Date,
  timeZone: string = APP_TIME_ZONE,
): ApplicationStats {
  const byStatus = emptyStatusCounts();
  const today = toDayKey(now, timeZone);
  const from = addDays(today, -6);
  let last7Days = 0;

  for (const app of applications) {
    byStatus[app.status] += 1;
    const day = applicationDay(app, timeZone);
    if (day >= from && day <= today) last7Days += 1;
  }

  return { total: applications.length, byStatus, responseRate: responseRate(byStatus), last7Days };
}

/** "42 %" o "—" si no hay datos. */
export function formatPercent(rate: number | null): string {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)} %`;
}
