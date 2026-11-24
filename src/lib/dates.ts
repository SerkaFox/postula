/** Zona horaria en la que se interpretan los "días" del usuario. */
export const APP_TIME_ZONE = "Europe/Madrid";

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Día de calendario (aaaa-mm-dd) de un instante en la zona indicada. */
export function toDayKey(instant: Date, timeZone: string = APP_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Suma días a un día aaaa-mm-dd (sin problemas de horario de verano). */
export function addDays(dayKey: string, days: number): string {
  const match = ISO_DAY.exec(dayKey);
  if (!match) throw new Error(`Fecha no válida: ${dayKey}`);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return date.toISOString().slice(0, 10);
}

/** ¿Es aaaa-mm-dd una fecha real del calendario? */
export function isValidDayKey(value: string): boolean {
  const match = ISO_DAY.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/**
 * Formato español dd/mm/aaaa.
 * Acepta un día `date` (aaaa-mm-dd, se muestra tal cual) o un `timestamptz` ISO
 * (se convierte a la zona de la aplicación). Devuelve "" si no hay valor válido.
 */
export function formatDateEs(value: string | null | undefined, timeZone: string = APP_TIME_ZONE): string {
  if (!value) return "";
  const day = ISO_DAY.test(value) ? value : toDayKeyOrEmpty(value, timeZone);
  if (!day || !isValidDayKey(day)) return "";
  const [y, m, d] = day.split("-");
  return `${d}/${m}/${y}`;
}

function toDayKeyOrEmpty(value: string, timeZone: string): string {
  const instant = new Date(value);
  return Number.isNaN(instant.getTime()) ? "" : toDayKey(instant, timeZone);
}
