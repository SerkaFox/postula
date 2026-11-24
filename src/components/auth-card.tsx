import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center text-2xl font-bold tracking-tight text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500">
          Postula
        </Link>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
          <p className="mb-5 mt-1 text-sm text-zinc-600">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
