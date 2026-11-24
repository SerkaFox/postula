/** Clases compartidas de botones y enlaces con aspecto de botón. */
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: `${base} bg-indigo-600 text-white shadow-sm hover:bg-indigo-700`,
  secondary: `${base} border border-zinc-300 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50`,
  danger: `${base} bg-rose-600 text-white shadow-sm hover:bg-rose-700`,
  ghost: `${base} text-zinc-700 hover:bg-zinc-100`,
} as const;

export const inputStyles =
  "w-full rounded-lg border bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1";
