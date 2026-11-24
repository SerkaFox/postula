type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

/** Campo con label asociado y error junto al campo. */
export function FormField({ id, label, type = "text", autoComplete, defaultValue, error, hint, required }: FormFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
          error ? "border-red-500" : "border-zinc-300"
        }`}
      />
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
