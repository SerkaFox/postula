import Link from "next/link";
import { NOTICE_MESSAGES, type NoticeKey } from "@/lib/notices";

/** Aviso de éxito tras crear, editar o borrar. */
export function Notice({ notice, dismissHref }: { notice: NoticeKey; dismissHref: string }) {
  return (
    <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      <p className="flex items-center gap-2">
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0 text-emerald-600">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" clipRule="evenodd" />
        </svg>
        {NOTICE_MESSAGES[notice]}
      </p>
      <Link href={dismissHref} scroll={false} className="rounded-md px-2 py-1 font-medium hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-indigo-600">
        Cerrar
      </Link>
    </div>
  );
}
