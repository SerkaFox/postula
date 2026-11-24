import { Logo } from "./logo";
import { LogoutButton } from "./logout-button";

export function AppHeader({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo href="/panel" />
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden truncate text-sm text-zinc-600 sm:inline" title={email}>
            {email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
