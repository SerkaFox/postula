/** Autorrelleno con IA: entrada, salida del modelo, normalización y mensajes. */
import { z } from "zod";
import { normalizeForSearch, type WorkMode } from "../applications";
import { checkOfferUrl } from "./network";

/** Usos por usuario en 24 h. */
export const AI_DAILY_LIMIT = 20;
/** Caracteres máximos que se pueden pegar. */
export const AI_INPUT_MAX = 20_000;
/** Texto mínimo (sin enlace) para que tenga sentido analizarlo. */
export const AI_TEXT_MIN = 40;

export type AutofillErrorCode =
  | "empty"
  | "too_long"
  | "too_short"
  | "invalid_url"
  | "blocked_url"
  | "fetch_failed"
  | "fetch_blocked"
  | "page_gone"
  | "not_html"
  | "no_content"
  | "not_an_offer"
  | "page_not_offer"
  | "nothing_found"
  | "ai_busy"
  | "ai_unavailable"
  | "ai_invalid"
  | "not_configured"
  | "quota"
  | "session";

const PASTE_TEXT = "Copia el texto de la oferta y pégalo aquí en lugar del enlace.";

export const AUTOFILL_ERRORS: Record<AutofillErrorCode, string> = {
  empty: "Pega el enlace o el texto de la oferta.",
  too_long: `El texto es demasiado largo: el máximo son ${AI_INPUT_MAX.toLocaleString("es-ES")} caracteres. Pega solo la descripción de la oferta.`,
  too_short: "Pega el texto completo de la oferta (al menos unas líneas) o su enlace.",
  invalid_url: "El enlace no es válido. Debe empezar por http:// o https://.",
  blocked_url: "No se pueden abrir enlaces a direcciones internas o locales. Usa el enlace público de la oferta.",
  fetch_failed: `No hemos podido abrir esa página. ${PASTE_TEXT}`,
  fetch_blocked: `Esa web no deja leer la oferta sin iniciar sesión (pasa, por ejemplo, con LinkedIn). ${PASTE_TEXT}`,
  page_gone: `Esa oferta ya no está publicada (la página no existe o se ha retirado). Si guardaste el texto, pégalo aquí.`,
  not_html: `El enlace no lleva a una página web con la oferta. ${PASTE_TEXT}`,
  no_content: `La página no tiene texto suficiente para leer la oferta. ${PASTE_TEXT}`,
  not_an_offer: "No parece una oferta de empleo. Revisa el enlace o el texto que has pegado.",
  page_not_offer: `No encontramos ninguna oferta en esa página (puede que pida iniciar sesión). ${PASTE_TEXT}`,
  nothing_found: "La IA no ha encontrado datos de la oferta en ese texto. Rellena el formulario a mano.",
  ai_busy: "La IA está saturada en este momento. Prueba de nuevo en un minuto.",
  ai_unavailable: "No hemos podido contactar con la IA. Inténtalo de nuevo en unos minutos.",
  ai_invalid: "La IA ha devuelto una respuesta que no se puede usar. Inténtalo de nuevo.",
  not_configured: "El autorrelleno con IA no está disponible ahora mismo. Rellena el formulario a mano.",
  quota: `Has llegado al límite de ${AI_DAILY_LIMIT} autorrellenos en 24 horas. Podrás volver a usarlo más tarde.`,
  session: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
};

/** Error con código conocido y mensaje listo para el usuario. */
export class AutofillError extends Error {
  constructor(readonly code: AutofillErrorCode) {
    super(AUTOFILL_ERRORS[code]);
    this.name = "AutofillError";
  }
}

export const autofillInputSchema = z
  .string({ error: AUTOFILL_ERRORS.empty })
  .trim()
  .min(1, AUTOFILL_ERRORS.empty)
  .max(AI_INPUT_MAX, AUTOFILL_ERRORS.too_long);

/** Una sola palabra con forma de host (y opcionalmente puerto y ruta). */
const HOST_LIKE = /^[a-z0-9-]+(\.[a-z0-9-]+)*(:\d+)?([/?#]\S*)?$/i;

export type AutofillInput = { kind: "url"; url: URL } | { kind: "text"; text: string };

/**
 * Decide si lo pegado es un enlace (una sola "palabra" que empieza por
 * http(s):// o tiene forma de host, como "www.ejemplo.com/oferta") o el texto
 * de la oferta.
 */
export function classifyInput(value: string): AutofillInput | { error: AutofillErrorCode } {
  const trimmed = value.trim();
  if (!trimmed) return { error: "empty" };
  if (trimmed.length > AI_INPUT_MAX) return { error: "too_long" };
  const single = !/\s/.test(trimmed);
  if (single && /^https?:\/\//i.test(trimmed)) {
    const check = checkOfferUrl(trimmed);
    return check.ok ? { kind: "url", url: check.url } : { error: check.error };
  }
  // Host sin esquema ("www.ejemplo.com/oferta", "localhost:3000", "10.0.0.1"): se trata
  // como enlace https y pasa las mismas comprobaciones (así "www.localhost" se bloquea).
  if (single && HOST_LIKE.test(trimmed) && (trimmed.includes(".") || /^localhost(?=$|[:/?#])/i.test(trimmed))) {
    const check = checkOfferUrl(`https://${trimmed}`);
    return check.ok ? { kind: "url", url: check.url } : { error: check.error };
  }
  if (single && /^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) return { error: "invalid_url" };
  if (trimmed.length < AI_TEXT_MIN) return { error: "too_short" };
  return { kind: "text", text: trimmed };
}

/** Esquema JSON que se pide a Gemini (subconjunto OpenAPI de `responseSchema`). */
export const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    es_oferta: { type: "BOOLEAN", description: "true si el texto es una oferta de empleo" },
    empresa: { type: "STRING", nullable: true, description: "Empresa que contrata (no la web de empleo)" },
    puesto: { type: "STRING", nullable: true, description: "Título del puesto" },
    ubicacion: { type: "STRING", nullable: true, description: "Ciudad o región; null si es solo remoto o no se indica" },
    modalidad: { type: "STRING", nullable: true, description: "remoto, hibrido o presencial; null si no se indica" },
    salario: { type: "STRING", nullable: true, description: "Salario tal como aparece; null si no se indica" },
    notas: { type: "STRING", nullable: true, description: "Resumen en español de 2-3 líneas: requisitos clave y stack" },
  },
  required: ["es_oferta", "empresa", "puesto", "ubicacion", "modalidad", "salario", "notas"],
  propertyOrdering: ["es_oferta", "empresa", "puesto", "ubicacion", "modalidad", "salario", "notas"],
} as const;

const modelText = z.string().max(10_000).nullish();

/** Lo que debe devolver el modelo; cualquier otra forma se rechaza. */
export const offerExtractionSchema = z.object({
  es_oferta: z.boolean().nullish(),
  empresa: modelText,
  puesto: modelText,
  ubicacion: modelText,
  modalidad: modelText,
  salario: modelText,
  notas: modelText,
});
export type OfferExtraction = z.infer<typeof offerExtractionSchema>;

/** Campos del formulario que puede rellenar la IA. */
export const AUTOFILL_FIELDS = ["company", "position", "url", "location", "work_mode", "salary", "notes"] as const;
export type AutofillField = (typeof AUTOFILL_FIELDS)[number];
export type AutofillValues = { [K in AutofillField]: K extends "work_mode" ? WorkMode | null : string | null };

export const AUTOFILL_FIELD_LABELS: Record<AutofillField, string> = {
  company: "Empresa",
  position: "Puesto",
  url: "Enlace",
  location: "Ubicación",
  work_mode: "Modalidad",
  salary: "Salario",
  notes: "Notas",
};

const PLACEHOLDERS = new Set([
  "", "null", "none", "n/a", "na", "-", "--", "?", "desconocido", "desconocida", "no especificado",
  "no especificada", "no indicado", "no indicada", "sin especificar", "no disponible", "unknown", "not specified",
]);

/** Recorta, une espacios y descarta valores vacíos o de relleno ("N/A", "No especificado"…). */
export function cleanValue(value: string | null | undefined, max: number, multiline = false): string | null {
  if (typeof value !== "string") return null;
  const text = multiline
    ? value.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()
    : value.replace(/\s+/g, " ").trim();
  if (PLACEHOLDERS.has(normalizeForSearch(text).replace(/\.$/, ""))) return null;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

const HYBRID = ["hibrido", "hibrida", "hybrid", "mixto", "mixta", "semipresencial", "semi-presencial", "flexible"];
const REMOTE = ["remoto", "remota", "remote", "teletrabajo", "telework", "work from home", "wfh", "a distancia", "desde casa", "anywhere"];
const ONSITE = ["presencial", "on-site", "onsite", "on site", "en oficina", "in office", "in-office", "oficina"];

/** Normaliza la modalidad: "Teletrabajo", "Remote", "Hybrid"… → remoto/hibrido/presencial. */
export function normalizeWorkMode(value: string | null | undefined): WorkMode | null {
  if (typeof value !== "string") return null;
  const text = normalizeForSearch(value);
  if (!text) return null;
  // Primero híbrido: "híbrido (2 días en remoto)" no es remoto.
  if (HYBRID.some((word) => text.includes(word))) return "hibrido";
  if (REMOTE.some((word) => text.includes(word))) return "remoto";
  if (ONSITE.some((word) => text.includes(word))) return "presencial";
  return null;
}

const FILLER = ["100%", "100 %", "full", "totalmente", "trabajo", "en", "modalidad", "puesto"];

/** true si el texto solo describe la modalidad ("100% remoto") y no un lugar. */
export function isOnlyWorkMode(value: string): boolean {
  if (!normalizeWorkMode(value)) return false;
  let text = normalizeForSearch(value);
  for (const word of [...HYBRID, ...REMOTE, ...ONSITE, ...FILLER].sort((a, b) => b.length - a.length)) {
    text = text.split(word).join(" ");
  }
  return !/[a-z]/.test(text);
}

/**
 * Convierte la salida validada del modelo en valores del formulario:
 * recorta a los límites del formulario, mueve "Remoto" de la ubicación a la
 * modalidad y usa como enlace la URL que pegó el usuario (nunca una del modelo).
 */
export function normalizeExtraction(raw: OfferExtraction, sourceUrl: string | null): AutofillValues {
  let location = cleanValue(raw.ubicacion, 200);
  let workMode = normalizeWorkMode(raw.modalidad);
  if (location && isOnlyWorkMode(location)) {
    // "Remoto", "100% remoto", "Teletrabajo": es una modalidad, no un lugar.
    workMode ??= normalizeWorkMode(location);
    location = null;
  }
  return {
    company: cleanValue(raw.empresa, 200),
    position: cleanValue(raw.puesto, 200),
    url: sourceUrl && sourceUrl.length <= 2000 ? sourceUrl : null,
    location,
    work_mode: workMode,
    salary: cleanValue(raw.salario, 200),
    notes: cleanValue(raw.notas, 1000, true),
  };
}

/** Campos con valor, en el orden del formulario. */
export function filledFields(values: AutofillValues): AutofillField[] {
  return AUTOFILL_FIELDS.filter((field) => values[field] !== null);
}
