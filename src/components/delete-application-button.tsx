"use client";

import { useRef, useState, useTransition } from "react";
import { deleteApplication } from "@/app/actions/applications";
import { buttonStyles } from "./ui";

type Props = {
  id: string;
  /** Nombre que se muestra en la confirmación (p. ej. "Frontend en Acme"). */
  label: string;
  /** Tras borrar, volver al panel (desde la página de edición). */
  goToPanel?: boolean;
  compact?: boolean;
};

/** Borrado en dos pasos: "Borrar" → "¿Seguro? Sí, borrar / Cancelar". */
export function DeleteApplicationButton({ id, label, goToPanel = false, compact = false }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);

  function cancel() {
    setConfirming(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteApplication(id, goToPanel);
      if (result.error) setError(result.error);
    });
  }

  if (!confirming) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={compact ? `Borrar ${label}` : undefined}
        className={compact ? `${buttonStyles.ghost} px-2.5 py-1.5 text-rose-700 hover:bg-rose-50` : `${buttonStyles.secondary} text-rose-700`}
      >
        Borrar
      </button>
    );
  }

  return (
    <div role="group" aria-label={`Confirmar borrado de ${label}`} className="flex flex-col gap-2 rounded-lg bg-rose-50 p-2 ring-1 ring-rose-200 ring-inset">
      <p className="text-sm text-rose-900">
        ¿Borrar <span className="font-semibold">{label}</span>? No se puede deshacer.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={confirm} disabled={pending} aria-busy={pending} className={`${buttonStyles.danger} px-3 py-1.5`}>
          {pending ? "Borrando…" : "Sí, borrar"}
        </button>
        {/* autoFocus en "Cancelar": la opción segura queda seleccionada. */}
        <button type="button" onClick={cancel} disabled={pending} autoFocus className={`${buttonStyles.secondary} px-3 py-1.5`}>
          Cancelar
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
