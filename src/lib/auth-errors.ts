/** Traduce los errores de Supabase Auth a mensajes en español para el usuario. */
export function authErrorMessage(error: { code?: string; message?: string } | null | undefined): string {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (code === "user_already_exists" || code === "email_exists" || message.includes("already registered")) {
    return "Ya existe una cuenta con ese email.";
  }
  if (code === "weak_password" || message.includes("password should be")) {
    return "La contraseña es demasiado débil.";
  }
  if (code === "email_not_confirmed") {
    return "Confirma tu email antes de entrar.";
  }
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento y vuelve a probar.";
  }
  if (code === "signup_disabled") {
    return "El registro está desactivado.";
  }
  return "No se ha podido completar la operación. Inténtalo de nuevo.";
}
