import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = { id: string; email: string };

/** Usuario de la sesión actual (verificado en servidor) o null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  // La sesión depende de la petición y de la hora (caducidad del token):
  // nunca se prerenderiza.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
}

/** Igual que getCurrentUser, pero redirige a /login si no hay sesión. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
