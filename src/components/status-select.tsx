"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatus } from "@/app/actions/applications";
import { APPLICATION_STATUSES, STATUS_LABELS, isApplicationStatus, type ApplicationStatus } from "@/lib/applications";
import { STATUS_STYLES } from "./status-style";

/** Selector de estado que guarda al momento (Server Action). */
export function StatusSelect({ id, status, label }: { id: string; status: ApplicationStatus; label: string }) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selectId = `estado-${id}`;

  function onChange(next: string) {
    if (!isApplicationStatus(next)) return;
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await updateApplicationStatus(id, next);
      if (result.error) {
        setValue(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="sr-only">
        Estado de {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          disabled={pending}
          aria-busy={pending}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full cursor-pointer appearance-none rounded-full py-1 pl-3 pr-8 text-sm font-medium ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-70 ${STATUS_STYLES[value].badge}`}
        >
          {APPLICATION_STATUSES.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABELS[option]}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 opacity-70">
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
        </svg>
      </div>
      <span aria-live="polite" className="sr-only">
        {pending ? "Guardando estado…" : ""}
      </span>
      {error ? (
        <p id={`${selectId}-error`} role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
