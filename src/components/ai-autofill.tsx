"use client";

import { useId, useState, useTransition, type RefObject } from "react";
import { autofillFromOffer } from "@/app/actions/autofill";
import { AI_INPUT_MAX, AUTOFILL_FIELD_LABELS, type AutofillField, type AutofillValues } from "@/lib/ai/autofill";
import { FormAlert } from "./form-parts";
import { buttonStyles, inputStyles } from "./ui";

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isControl(element: Element | RadioNodeList | null): element is Control {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
}

/** Escribe los valores en el formulario y marca los campos rellenados hasta que el usuario los toque. */
function applyToForm(form: HTMLFormElement, values: AutofillValues, fields: readonly AutofillField[]) {
  for (const field of fields) {
    const control = form.elements.namedItem(field);
    const value = values[field];
    if (!isControl(control) || value === null) continue;
    const current = control.value.trim();
    // Las notas que ya hubiera escrito el usuario no se pierden.
    control.value = field === "notes" && current && !current.includes(value) ? `${current}\n\n${value}` : value;
    control.dataset.autofilled = "true";
    const clear = () => delete control.dataset.autofilled;
    control.addEventListener(control instanceof HTMLSelectElement ? "change" : "input", clear, { once: true });
  }
}

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "done"; filled: AutofillField[]; remaining: number };

/** Panel "Rellenar con IA": pega un enlace o el texto de una oferta y rellena el formulario. */
export function AiAutofill({ formRef }: { formRef: RefObject<HTMLFormElement | null> }) {
  const id = useId();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function run() {
    if (pending) return;
    if (!input.trim()) {
      setStatus({ kind: "error", message: "Pega el enlace o el texto de la oferta." });
      return;
    }
    setStatus({ kind: "idle" });
    startTransition(async () => {
      try {
        const result = await autofillFromOffer(input);
        if (!result.ok) {
          setStatus({ kind: "error", message: result.error });
          return;
        }
        if (formRef.current) applyToForm(formRef.current, result.values, result.filled);
        setStatus({ kind: "done", filled: result.filled, remaining: result.remaining });
      } catch {
        setStatus({ kind: "error", message: "No se ha podido conectar. Revisa tu conexión e inténtalo de nuevo." });
      }
    });
  }

  const inputId = `${id}-offer`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const tooLong = input.length > AI_INPUT_MAX;

  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={pending}
      className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white p-4 shadow-sm sm:p-5"
    >
      <h2 id={`${id}-title`} className="flex items-center gap-2 text-base font-semibold text-indigo-950">
        <span aria-hidden="true">✨</span> Rellenar con IA
      </h2>
      <p id={hintId} className="mt-1 text-sm text-zinc-700">
        Pega el enlace de la oferta o su texto. La IA propone los datos y tú los revisas antes de guardar.
      </p>

      <div className="mt-3 flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-800">
          Enlace o texto de la oferta
        </label>
        <textarea
          id={inputId}
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              run();
            }
          }}
          placeholder="https://… o pega aquí la descripción de la oferta"
          aria-describedby={status.kind === "error" ? `${hintId} ${errorId}` : hintId}
          aria-invalid={status.kind === "error" || tooLong ? true : undefined}
          className={`${inputStyles} resize-y border-zinc-300`}
        />
      </div>

      <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-xs tabular-nums ${tooLong ? "font-medium text-red-700" : "text-zinc-600"}`}>
          {input.length.toLocaleString("es-ES")} / {AI_INPUT_MAX.toLocaleString("es-ES")} caracteres
        </p>
        <button type="button" onClick={run} disabled={pending || tooLong} aria-busy={pending} className={buttonStyles.primary}>
          {pending ? (
            <>
              <span aria-hidden="true" className="size-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin" />
              Analizando la oferta…
            </>
          ) : (
            <>
              <span aria-hidden="true">✨</span> Rellenar con IA
            </>
          )}
        </button>
      </div>

      <div aria-live="polite" className="mt-3 empty:hidden">
        {status.kind === "error" ? <FormAlert id={errorId} message={status.message} /> : null}
        {status.kind === "done" ? (
          <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Rellenado: <strong>{status.filled.map((field) => AUTOFILL_FIELD_LABELS[field]).join(", ")}</strong>. Revisa los
            campos marcados antes de guardar.{" "}
            <span className="text-emerald-800">
              Te quedan {status.remaining} {status.remaining === 1 ? "uso" : "usos"} hoy.
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
