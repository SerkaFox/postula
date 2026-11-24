import type { ReactNode } from "react";
import { inputStyles } from "./ui";

type BaseProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

type FormFieldProps = BaseProps & {
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
};

function describedBy(id: string, hint?: string, error?: string) {
  return [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

function controlClass(error?: string) {
  return `${inputStyles} ${error ? "border-red-500" : "border-zinc-300"}`;
}

/** Label + control + pista/error junto al campo. */
function FieldShell({ id, label, error, hint, required, children }: BaseProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800">
        {label}
        {required ? (
          <span className="text-rose-700" aria-hidden="true">
            {" "}*
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-zinc-600">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Campo con label asociado y error junto al campo. */
export function FormField({ type = "text", autoComplete, defaultValue, placeholder, maxLength, ...shell }: FormFieldProps) {
  const { id, error, hint, required } = shell;
  return (
    <FieldShell {...shell}>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClass(error)}
      />
    </FieldShell>
  );
}

export function SelectField({
  options,
  defaultValue,
  ...shell
}: BaseProps & { options: readonly { value: string; label: string }[]; defaultValue?: string }) {
  const { id, error, hint, required } = shell;
  return (
    <FieldShell {...shell}>
      <select
        id={id}
        name={id}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClass(error)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function TextareaField({
  defaultValue,
  rows = 5,
  maxLength,
  placeholder,
  ...shell
}: BaseProps & { defaultValue?: string; rows?: number; maxLength?: number; placeholder?: string }) {
  const { id, error, hint, required } = shell;
  return (
    <FieldShell {...shell}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${controlClass(error)} resize-y`}
      />
    </FieldShell>
  );
}
