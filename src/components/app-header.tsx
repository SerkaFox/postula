import Link from "next/link";
import { LogoutButton } from "./logout-button";

export function AppHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/panel" className="text-lg font-bold tracking-tight text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500">
          Postula
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm text-zinc-600" title={email}>
            {email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
