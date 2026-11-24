/**
 * Comprobaciones puras contra SSRF: qué direcciones IP y qué URL se pueden
 * descargar desde el servidor. Solo se permite internet público.
 */

/** Rangos IPv4 que nunca se descargan: privados, loopback, link-local (metadatos), reservados… */
const BLOCKED_V4: readonly (readonly [string, number])[] = [
  ["0.0.0.0", 8], // "esta red"
  ["10.0.0.0", 8], // privada
  ["100.64.0.0", 10], // CGNAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local (incluye 169.254.169.254, metadatos de la nube)
  ["172.16.0.0", 12], // privada
  ["192.0.0.0", 24], // asignaciones IETF
  ["192.0.2.0", 24], // documentación
  ["192.88.99.0", 24], // relay 6to4
  ["192.168.0.0", 16], // privada
  ["198.18.0.0", 15], // pruebas de rendimiento
  ["198.51.100.0", 24], // documentación
  ["203.0.113.0", 24], // documentación
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reservada + broadcast
];

/** Convierte "a.b.c.d" en entero sin signo, o null si no es IPv4 en notación decimal estricta. */
export function parseIPv4(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }
  return value;
}

function inV4Range(ip: number, base: string, bits: number): boolean {
  const start = parseIPv4(base) ?? 0;
  const size = 2 ** (32 - bits);
  return ip >= start && ip < start + size;
}

/** Expande una IPv6 a sus 8 bloques de 16 bits, o null si no es válida. */
export function parseIPv6(input: string): number[] | null {
  let ip = input.trim().toLowerCase();
  if (ip.startsWith("[") && ip.endsWith("]")) ip = ip.slice(1, -1);
  const zone = ip.indexOf("%");
  if (zone !== -1) ip = ip.slice(0, zone);
  if (!ip.includes(":")) return null;

  // IPv4 incrustada al final (p. ej. ::ffff:127.0.0.1)
  const tail: number[] = [];
  const lastColon = ip.lastIndexOf(":");
  const maybeV4 = ip.slice(lastColon + 1);
  if (maybeV4.includes(".")) {
    const v4 = parseIPv4(maybeV4);
    if (v4 === null) return null;
    tail.push(Math.floor(v4 / 65536), v4 % 65536);
    ip = `${ip.slice(0, lastColon + 1)}`;
    // "::ffff:" → "::ffff" ; "::" se queda como "::"
    if (ip.endsWith(":") && !ip.endsWith("::")) ip = ip.slice(0, -1);
  }

  const halves = ip.split("::");
  if (halves.length > 2) return null;
  const toBlocks = (part: string) => (part === "" ? [] : part.split(":"));
  const head = toBlocks(halves[0] ?? "");
  const rest = halves.length === 2 ? toBlocks(halves[1] ?? "") : [];
  const known = head.length + rest.length + tail.length;
  if (halves.length === 1 && known !== 8) return null;
  if (halves.length === 2 && known > 7) return null;

  const blocks: number[] = [];
  for (const block of [...head, ...Array(8 - known).fill("0"), ...rest]) {
    if (!/^[0-9a-f]{1,4}$/.test(block)) return null;
    blocks.push(parseInt(block, 16));
  }
  return [...blocks, ...tail];
}

function isPublicIPv6(blocks: number[]): boolean {
  const [a = 0, b = 0] = blocks;
  // IPv4 mapeada (::ffff:a.b.c.d): se decide por la IPv4.
  if (blocks.slice(0, 5).every((x) => x === 0) && blocks[5] === 0xffff) {
    const v4 = (blocks[6] ?? 0) * 65536 + (blocks[7] ?? 0);
    return isPublicIPv4Number(v4);
  }
  // Solo unicast global (2000::/3)…
  if ((a & 0xe000) !== 0x2000) return false;
  // …sin documentación, Teredo ni 6to4 (pueden apuntar a IPv4 internas).
  if (a === 0x2001 && b === 0x0db8) return false;
  if (a === 0x2001 && b === 0x0000) return false;
  if (a === 0x2002) return false;
  return true;
}

function isPublicIPv4Number(ip: number): boolean {
  return !BLOCKED_V4.some(([base, bits]) => inV4Range(ip, base, bits));
}

/**
 * true solo si la IP es de internet público. Rechaza loopback, redes privadas,
 * link-local (metadatos 169.254.169.254, fe80::), ULA (fc00::/7), multicast,
 * IPv4 mapeadas a privadas y cualquier cosa que no se pueda interpretar.
 */
export function isPublicIp(ip: string): boolean {
  const v4 = parseIPv4(ip);
  if (v4 !== null) return isPublicIPv4Number(v4);
  const v6 = parseIPv6(ip);
  if (v6 !== null) return isPublicIPv6(v6);
  return false;
}

export type OfferUrlError = "invalid_url" | "blocked_url";
export type OfferUrlCheck = { ok: true; url: URL } | { ok: false; error: OfferUrlError };

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa", ".lan"];

/**
 * Valida que una URL se pueda descargar: http/https, sin credenciales, puerto
 * por defecto y host que no sea local. Si el host es una IP literal, debe ser
 * pública (Node no consulta el DNS para IPs literales).
 */
export function checkOfferUrl(raw: string | URL): OfferUrlCheck {
  let url: URL;
  try {
    url = typeof raw === "string" ? new URL(raw.trim()) : new URL(raw.href);
  } catch {
    return { ok: false, error: "invalid_url" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, error: "invalid_url" };
  if (url.username || url.password) return { ok: false, error: "blocked_url" };
  if (url.port && url.port !== "80" && url.port !== "443") return { ok: false, error: "blocked_url" };

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return { ok: false, error: "invalid_url" };
  if (host === "localhost" || BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return { ok: false, error: "blocked_url" };
  }
  const literal = host.startsWith("[") ? host.slice(1, -1) : host;
  if (parseIPv4(literal) !== null || literal.includes(":")) {
    return isPublicIp(literal) ? { ok: true, url } : { ok: false, error: "blocked_url" };
  }
  // Formas numéricas raras que el resolvedor aceptaría como IP (p. ej. 2130706433, 0x7f.1).
  if (/^[0-9.]+$/.test(host) || /^0x[0-9a-f.]+$/i.test(host)) return { ok: false, error: "blocked_url" };
  if (!host.includes(".")) return { ok: false, error: "blocked_url" };
  return { ok: true, url };
}
