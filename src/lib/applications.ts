/** Modelo de candidatura compartido por servidor, cliente y lógica pura. */

export const APPLICATION_STATUSES = ["guardada", "aplicada", "entrevista", "oferta", "rechazada"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const WORK_MODES = ["remoto", "hibrido", "presencial"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  guardada: "Guardada",
  aplicada: "Aplicada",
  entrevista: "Entrevista",
  oferta: "Oferta",
  rechazada: "Rechazada",
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remoto: "Remoto",
  hibrido: "Híbrido",
  presencial: "Presencial",
};

export type Application = {
  id: string;
  company: string;
  position: string;
  url: string | null;
  location: string | null;
  work_mode: WorkMode | null;
  salary: string | null;
  status: ApplicationStatus;
  applied_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Columnas que se piden a Supabase (sin user_id: el filtro lo pone el servidor). */
export const APPLICATION_COLUMNS =
  "id, company, position, url, location, work_mode, salary, status, applied_on, notes, created_at, updated_at";

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export type ApplicationFilters = { status: ApplicationStatus | null; q: string };

/** Lee los filtros de la URL (?estado=…&q=…), ignorando valores no válidos. */
export function parseFilters(params: Record<string, string | string[] | undefined>): ApplicationFilters {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
  const status = first(params.estado);
  return {
    status: isApplicationStatus(status) ? status : null,
    q: first(params.q).trim().slice(0, 100),
  };
}

/** Minúsculas y sin acentos, para buscar "telefonica" y encontrar "Telefónica". */
export function normalizeForSearch(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Filtra por estado y por texto en empresa o puesto. */
export function filterApplications<T extends Pick<Application, "status" | "company" | "position">>(
  applications: readonly T[],
  filters: ApplicationFilters,
): T[] {
  const needle = normalizeForSearch(filters.q);
  return applications.filter((app) => {
    if (filters.status && app.status !== filters.status) return false;
    if (!needle) return true;
    return normalizeForSearch(app.company).includes(needle) || normalizeForSearch(app.position).includes(needle);
  });
}

/** Más reciente primero: fecha de candidatura (o de alta si no la hay) y luego alta. */
export function sortByDateDesc<T extends Pick<Application, "applied_on" | "created_at">>(applications: readonly T[]): T[] {
  const key = (app: T) => app.applied_on ?? app.created_at.slice(0, 10);
  return [...applications].sort((a, b) => {
    const byDay = key(b).localeCompare(key(a));
    return byDay !== 0 ? byDay : b.created_at.localeCompare(a.created_at);
  });
}

/** Construye la URL del panel con filtros, omitiendo los vacíos. */
export function panelHref(filters: Partial<ApplicationFilters>): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("estado", filters.status);
  if (filters.q) params.set("q", filters.q);
  const query = params.toString();
  return query ? `/panel?${query}` : "/panel";
}
