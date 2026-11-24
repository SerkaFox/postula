import type { ApplicationStatus } from "@/lib/applications";

/** Colores de cada estado (texto con contraste AA sobre su fondo). */
export const STATUS_STYLES: Record<ApplicationStatus, { badge: string; dot: string; bar: string }> = {
  guardada: { badge: "bg-slate-100 text-slate-700 ring-slate-300", dot: "bg-slate-400", bar: "bg-slate-400" },
  aplicada: { badge: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500", bar: "bg-sky-500" },
  entrevista: { badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500", bar: "bg-amber-500" },
  oferta: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  rechazada: { badge: "bg-rose-50 text-rose-800 ring-rose-200", dot: "bg-rose-500", bar: "bg-rose-500" },
};
