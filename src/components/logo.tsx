import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md text-lg font-bold tracking-tight text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
        P
      </span>
      Postula
    </Link>
  );
}
