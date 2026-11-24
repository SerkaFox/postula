import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/** Rutas que exigen sesión (comprobado también en cada página). */
const PRIVATE_PREFIXES = ["/panel", "/candidaturas"];

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Páginas de acceso: con sesión iniciada se redirige al panel. */
export function isAuthPath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/registro";
}

/** Refresca la sesión de Supabase y redirige a /login si una ruta privada no tiene sesión. */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // No poner código entre createServerClient y getClaims: refresca el token.
  const { data } = await supabase.auth.getClaims();
  const hasSession = Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  if (!hasSession && isPrivatePath(pathname)) {
    return redirectWithCookies(request, response, "/login");
  }
  if (hasSession && isAuthPath(pathname)) {
    return redirectWithCookies(request, response, "/panel");
  }

  return response;
}

function redirectWithCookies(request: NextRequest, response: NextResponse, pathname: string) {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = "";
  const redirect = NextResponse.redirect(target);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
