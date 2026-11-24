/** Convierte el HTML de una página de oferta en texto plano breve para la IA. */

export const MAX_PAGE_TEXT = 12_000;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü", ccedil: "ç", Ccedil: "Ç",
  agrave: "à", egrave: "è", ograve: "ò", iexcl: "¡", iquest: "¿",
  ordm: "º", ordf: "ª", euro: "€", middot: "·", bull: "•", hellip: "…",
  ndash: "–", mdash: "—", laquo: "«", raquo: "»", ldquo: "“", rdquo: "”",
  lsquo: "‘", rsquo: "’", copy: "©", reg: "®", trade: "™", deg: "°",
};

/** Decodifica entidades HTML numéricas y las con nombre más comunes. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

/** Atributos de una etiqueta HTML (`name="x" content='y'`), con nombres en minúsculas. */
function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-z_:][-a-z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
  for (const m of tag.matchAll(re)) {
    const name = (m[1] ?? "").toLowerCase();
    attrs[name] = decodeEntities(m[3] ?? m[4] ?? m[5] ?? "");
  }
  return attrs;
}

function clean(text: string): string {
  return decodeEntities(text).replace(/\s+/g, " ").trim();
}

/** Quita etiquetas y deja una línea por bloque. */
function stripTags(html: string): string {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|head|nav|footer|form|select)\b[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<(br|hr)\b[^>]*>/gi, "\n")
    .replace(/<\/?(p|div|li|ul|ol|h[1-6]|tr|td|th|table|section|article|header|main|aside|dd|dt|blockquote|pre)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, " ");
  const lines: string[] = [];
  for (const raw of decodeEntities(text).split("\n")) {
    const line = raw.replace(/[ \t\f\v ]+/g, " ").trim();
    if (line && line !== lines[lines.length - 1]) lines.push(line);
  }
  return lines.join("\n");
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function asRecord(value: JsonValue | undefined): Record<string, JsonValue> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function asText(value: JsonValue | undefined): string {
  if (typeof value === "string") return clean(stripTags(value));
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
  const record = asRecord(value);
  if (!record) return "";
  // Objetos habituales de schema.org: Organization, Place, MonetaryAmount…
  if (typeof record.name === "string") return clean(record.name);
  const address = asRecord(record.address);
  if (address) return asText(address);
  const parts = ["addressLocality", "addressRegion", "addressCountry", "minValue", "maxValue", "value", "currency", "unitText"]
    .map((key) => asText(record[key]))
    .filter(Boolean);
  return parts.join(" ");
}

function findJobPosting(value: JsonValue): Record<string, JsonValue> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  const record = asRecord(value);
  if (!record) return null;
  const type = record["@type"];
  if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return record;
  return record["@graph"] ? findJobPosting(record["@graph"]) : null;
}

/** Resume los datos estructurados JobPosting (schema.org) si la página los trae. */
export function jobPostingSummary(html: string): string {
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data: JsonValue;
    try {
      data = JSON.parse(m[1] ?? "") as JsonValue;
    } catch {
      continue;
    }
    const job = findJobPosting(data);
    if (!job) continue;
    const fields: [string, JsonValue | undefined][] = [
      ["Puesto", job.title],
      ["Empresa", job.hiringOrganization],
      ["Ubicación", job.jobLocation],
      ["Tipo de ubicación", job.jobLocationType],
      ["Salario", job.baseSalary],
      ["Jornada", job.employmentType],
      ["Descripción", job.description],
    ];
    return fields
      .map(([label, value]) => [label, asText(value)] as const)
      .filter(([, text]) => text)
      .map(([label, text]) => `${label}: ${text}`)
      .join("\n");
  }
  return "";
}

/**
 * Texto de una página: título, meta descripción, datos JobPosting y texto
 * visible (sin scripts, estilos, navegación ni pie), recortado a `maxChars`.
 */
export function htmlToText(html: string, maxChars = MAX_PAGE_TEXT): string {
  const title = clean(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");

  let description = "";
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = parseAttributes(m[0]);
    const key = (attrs.name ?? attrs.property ?? "").toLowerCase();
    if ((key === "description" || key === "og:description") && attrs.content) {
      description = clean(attrs.content);
      if (key === "description") break;
    }
  }

  const structured = jobPostingSummary(html);
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const body = stripTags(bodyMatch?.[1] ?? html);

  const parts = [
    title ? `Título: ${title}` : "",
    description ? `Descripción: ${description}` : "",
    structured ? `Datos estructurados:\n${structured}` : "",
    body ? `Texto de la página:\n${body}` : "",
  ].filter(Boolean);
  const text = parts.join("\n\n");
  return text.length > maxChars ? `${text.slice(0, maxChars).trimEnd()}…` : text;
}
