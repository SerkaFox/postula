/**
 * Descarga segura de la página de una oferta (solo servidor).
 * - Solo http/https a internet público: el host se resuelve y se rechazan IPs
 *   privadas, loopback, link-local y de metadatos. La comprobación se hace en el
 *   `lookup` de la propia conexión, así que no hay ventana para DNS rebinding.
 * - Redirecciones manuales (máx. 3), validando cada destino igual.
 * - 8 s en total, solo text/html, y como mucho 1,5 MB descomprimidos.
 */
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import type { LookupFunction } from "node:net";
import { pipeline, type Readable } from "node:stream";
import zlib from "node:zlib";
import { AutofillError } from "./autofill";
import { checkOfferUrl, isPublicIp } from "./network";

export const FETCH_TIMEOUT_MS = 8_000;
export const FETCH_MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;

type Resolver = (
  hostname: string,
  options: dns.LookupAllOptions,
  callback: (err: NodeJS.ErrnoException | null, addresses: dns.LookupAddress[]) => void,
) => void;

const defaultResolver: Resolver = (hostname, options, callback) => dns.lookup(hostname, options, callback);

/** Código de error que se usa cuando el host resuelve a una IP no pública. */
export const BLOCKED_ADDRESS = "EPOSTULA_BLOCKED_ADDRESS";

/** `lookup` para http(s).request que solo deja conectar a IPs públicas. */
export function guardedLookup(resolver: Resolver = defaultResolver): LookupFunction {
  return (hostname, options, callback) => {
    resolver(hostname, { ...options, all: true }, (err, addresses) => {
      if (err) return callback(err, "", undefined);
      const list = Array.isArray(addresses) ? addresses : [];
      if (list.length === 0 || list.some((entry) => !isPublicIp(entry.address))) {
        const blocked: NodeJS.ErrnoException = new Error(`Dirección no permitida para ${hostname}`);
        blocked.code = BLOCKED_ADDRESS;
        return callback(blocked, "", undefined);
      }
      if (options.all) return callback(null, list);
      const first = list[0];
      return callback(null, first?.address ?? "", first?.family);
    });
  };
}

/** Juego de caracteres de un Content-Type, con utf-8 por defecto. */
export function charsetOf(contentType: string): string {
  const match = /charset\s*=\s*"?([\w.:-]+)/i.exec(contentType);
  const label = match?.[1]?.toLowerCase() ?? "utf-8";
  try {
    new TextDecoder(label);
    return label;
  } catch {
    return "utf-8";
  }
}

export function isHtmlContentType(contentType: string): boolean {
  const type = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return type === "text/html" || type === "application/xhtml+xml";
}

/** Páginas de login que algunas webs (LinkedIn…) devuelven en lugar de la oferta. */
export function isLoginWall(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();
  return /(^|\/)(authwall|login|signin|sign-in|uas\/login|checkpoint)(\/|$)/.test(path) || (host.endsWith("linkedin.com") && path.startsWith("/authwall"));
}

type Hop = { status: number; location: string | null; contentType: string; body: Readable; release: () => void };

function request(url: URL, signal: AbortSignal, resolver: Resolver): Promise<Hop> {
  const client = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: "GET",
        lookup: guardedLookup(resolver),
        signal,
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; PostulaBot/1.0; +autorrelleno de ofertas)",
          accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "accept-language": "es-ES,es;q=0.9,en;q=0.6",
          "accept-encoding": "gzip, deflate, br",
        },
      },
      (res) => {
        const header = (name: string) => {
          const value = res.headers[name];
          return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
        };
        resolve({
          status: res.statusCode ?? 0,
          location: header("location") || null,
          contentType: header("content-type"),
          body: decode(res, header("content-encoding")),
          release: () => res.destroy(),
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function decode(res: http.IncomingMessage, encoding: string): Readable {
  const decompressors: Record<string, () => zlib.Gunzip | zlib.Inflate | zlib.BrotliDecompress> = {
    gzip: zlib.createGunzip,
    "x-gzip": zlib.createGunzip,
    deflate: zlib.createInflate,
    br: zlib.createBrotliDecompress,
  };
  const create = decompressors[encoding.trim().toLowerCase()];
  if (!create) return res;
  // pipeline propaga errores y cortes (timeout) de la respuesta al descompresor.
  return pipeline(res, create(), () => {});
}

/** Lee como mucho `maxBytes` (descomprimidos) y corta el resto. */
async function readCapped(body: Readable, maxBytes: number, release: () => void): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    for await (const chunk of body) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
      const room = maxBytes - total;
      chunks.push(room < buffer.length ? buffer.subarray(0, room) : buffer);
      total += Math.min(buffer.length, room);
      if (total >= maxBytes) break;
    }
  } finally {
    release();
    body.destroy();
  }
  return Buffer.concat(chunks);
}

type FetchOptions = { resolver?: Resolver; timeoutMs?: number; maxBytes?: number };

/** Descarga el HTML de una oferta. Lanza AutofillError con un código conocido. */
export async function fetchOfferPage(input: URL, options: FetchOptions = {}): Promise<{ url: URL; html: string }> {
  const { resolver = defaultResolver, timeoutMs = FETCH_TIMEOUT_MS, maxBytes = FETCH_MAX_BYTES } = options;
  const signal = AbortSignal.timeout(timeoutMs);
  let url = input;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const check = checkOfferUrl(url);
    if (!check.ok) throw new AutofillError(check.error);
    if (isLoginWall(url)) throw new AutofillError("fetch_blocked");

    let res: Hop;
    try {
      res = await request(url, signal, resolver);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException | undefined)?.code;
      throw new AutofillError(code === BLOCKED_ADDRESS ? "blocked_url" : "fetch_failed");
    }

    if (res.status >= 300 && res.status < 400) {
      res.release();
      if (!res.location) throw new AutofillError("fetch_failed");
      try {
        url = new URL(res.location, url);
      } catch {
        throw new AutofillError("fetch_failed");
      }
      continue;
    }
    if (res.status === 401 || res.status === 403 || res.status === 429 || res.status === 999) {
      res.release();
      throw new AutofillError("fetch_blocked");
    }
    if (res.status === 404 || res.status === 410) {
      res.release();
      throw new AutofillError("page_gone");
    }
    if (res.status < 200 || res.status >= 300) {
      res.release();
      throw new AutofillError("fetch_failed");
    }
    if (!isHtmlContentType(res.contentType)) {
      res.release();
      throw new AutofillError("not_html");
    }

    let bytes: Buffer;
    try {
      bytes = await readCapped(res.body, maxBytes, res.release);
    } catch {
      throw new AutofillError("fetch_failed");
    }
    return { url, html: new TextDecoder(charsetOf(res.contentType)).decode(bytes) };
  }
  throw new AutofillError("fetch_failed");
}
