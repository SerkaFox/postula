import type { LookupAddress } from "node:dns";
import { describe, expect, it, vi } from "vitest";
import { BLOCKED_ADDRESS, charsetOf, fetchOfferPage, guardedLookup, isHtmlContentType, isLoginWall } from "./fetch-page";

function resolverFor(addresses: LookupAddress[]) {
  return vi.fn((_host: string, _options: object, callback: (err: NodeJS.ErrnoException | null, list: LookupAddress[]) => void) =>
    callback(null, addresses),
  );
}

function lookupResult(addresses: LookupAddress[], all: boolean) {
  return new Promise<{ err: NodeJS.ErrnoException | null; address: unknown; family?: number }>((resolve) => {
    guardedLookup(resolverFor(addresses))("example.com", { all }, (err, address, family) => resolve({ err, address, family }));
  });
}

describe("guardedLookup", () => {
  it("deja pasar hosts que resuelven a IPs públicas", async () => {
    const one = await lookupResult([{ address: "93.184.215.14", family: 4 }], false);
    expect(one).toEqual({ err: null, address: "93.184.215.14", family: 4 });
    const all = await lookupResult([{ address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c", family: 6 }], true);
    expect(all.address).toEqual([{ address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c", family: 6 }]);
  });

  it("bloquea si alguna IP es privada, de loopback o de metadatos", async () => {
    for (const address of ["127.0.0.1", "10.0.0.5", "169.254.169.254", "::1"]) {
      const result = await lookupResult([{ address: "93.184.215.14", family: 4 }, { address, family: address.includes(":") ? 6 : 4 }], false);
      expect(result.err?.code).toBe(BLOCKED_ADDRESS);
    }
  });

  it("bloquea si no hay direcciones", async () => {
    expect((await lookupResult([], false)).err?.code).toBe(BLOCKED_ADDRESS);
  });
});

describe("fetchOfferPage", () => {
  it("no conecta a hosts que resuelven a una IP interna", async () => {
    const resolver = resolverFor([{ address: "127.0.0.1", family: 4 }]);
    await expect(fetchOfferPage(new URL("http://ofertas.example.com/"), { resolver })).rejects.toMatchObject({ code: "blocked_url" });
    expect(resolver).toHaveBeenCalled();
  });

  it("rechaza URLs locales sin llegar a resolverlas", async () => {
    const resolver = resolverFor([{ address: "93.184.215.14", family: 4 }]);
    await expect(fetchOfferPage(new URL("http://169.254.169.254/latest/meta-data/"), { resolver })).rejects.toMatchObject({ code: "blocked_url" });
    expect(resolver).not.toHaveBeenCalled();
  });

  it("detecta muros de login antes de descargar", async () => {
    await expect(fetchOfferPage(new URL("https://www.linkedin.com/authwall?x=1"))).rejects.toMatchObject({ code: "fetch_blocked" });
  });
});

describe("utilidades de respuesta", () => {
  it("lee el charset o usa utf-8", () => {
    expect(charsetOf("text/html; charset=ISO-8859-1")).toBe("iso-8859-1");
    expect(charsetOf("text/html")).toBe("utf-8");
    expect(charsetOf("text/html; charset=inventado")).toBe("utf-8");
  });

  it("solo acepta HTML", () => {
    expect(isHtmlContentType("text/html; charset=utf-8")).toBe(true);
    expect(isHtmlContentType("application/xhtml+xml")).toBe(true);
    expect(isHtmlContentType("application/pdf")).toBe(false);
    expect(isHtmlContentType("")).toBe(false);
  });

  it("reconoce rutas de login", () => {
    expect(isLoginWall(new URL("https://www.linkedin.com/authwall?trk=x"))).toBe(true);
    expect(isLoginWall(new URL("https://example.com/login"))).toBe(true);
    expect(isLoginWall(new URL("https://www.tecnoempleo.com/senior-java/rf-1"))).toBe(false);
  });
});
