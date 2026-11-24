import { Logo } from "./logo";
import { LogoutButton } from "./logout-button";

export function AppHeader({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="shrink-0">
          <Logo href="/panel" />
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {/* En móvil el email se recorta con "…"; completo en el title y para lectores de pantalla. */}
          <span className="min-w-0 truncate text-xs text-zinc-600 sm:text-sm" title={email}>
            <span className="sr-only">Sesión iniciada como </span>
            {email}
          </span>
          <div className="shrink-0">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
