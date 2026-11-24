import { describe, expect, it } from "vitest";
import { checkOfferUrl, isPublicIp, parseIPv6 } from "./network";

describe("isPublicIp", () => {
  it("acepta IPs públicas v4 y v6", () => {
    expect(isPublicIp("8.8.8.8")).toBe(true);
    expect(isPublicIp("151.101.1.69")).toBe(true);
    expect(isPublicIp("2606:4700:4700::1111")).toBe(true);
  });

  it.each([
    "127.0.0.1", "127.255.255.254", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.10",
    "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "255.255.255.255", "192.0.2.5",
  ])("rechaza la IPv4 no pública %s", (ip) => {
    expect(isPublicIp(ip)).toBe(false);
  });

  it.each(["::1", "::", "fe80::1", "fd00:ec2::254", "fc00::1", "ff02::1", "2001:db8::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:169.254.169.254", "2002:7f00:1::1"])(
    "rechaza la IPv6 no pública %s",
    (ip) => {
      expect(isPublicIp(ip)).toBe(false);
    },
  );

  it("decide las IPv4 mapeadas por la IPv4", () => {
    expect(isPublicIp("::ffff:8.8.8.8")).toBe(true);
  });

  it("rechaza lo que no es una IP", () => {
    expect(isPublicIp("")).toBe(false);
    expect(isPublicIp("example.com")).toBe(false);
    expect(isPublicIp("256.1.1.1")).toBe(false);
    expect(isPublicIp("1:2:3")).toBe(false);
  });

  it("expande IPv6 abreviadas", () => {
    expect(parseIPv6("::1")).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
    expect(parseIPv6("[fe80::1%eth0]")).toEqual([0xfe80, 0, 0, 0, 0, 0, 0, 1]);
    expect(parseIPv6("1::2::3")).toBeNull();
  });
});

describe("checkOfferUrl", () => {
  it("acepta enlaces http(s) públicos", () => {
    const check = checkOfferUrl("https://www.tecnoempleo.com/oferta/rf-123");
    expect(check.ok && check.url.hostname).toBe("www.tecnoempleo.com");
    expect(checkOfferUrl("http://8.8.8.8/x").ok).toBe(true);
  });

  it.each(["ftp://example.com/a", "javascript:alert(1)", "file:///etc/passwd", "no es una url"])("rechaza %s como no válido", (url) => {
    expect(checkOfferUrl(url)).toEqual({ ok: false, error: "invalid_url" });
  });

  it.each([
    "http://localhost:3000/",
    "http://127.0.0.1/",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]/",
    "http://2130706433/",
    "http://0x7f.1/",
    "http://intranet/",
    "http://printer.local/",
    "https://user:pass@example.com/",
    "https://example.com:8443/",
  ])("bloquea %s", (url) => {
    expect(checkOfferUrl(url)).toEqual({ ok: false, error: "blocked_url" });
  });
});
