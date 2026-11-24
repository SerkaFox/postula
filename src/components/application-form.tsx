"use client";

import Link from "next/link";
import { useActionState, type Ref } from "react";
import {
  createApplication,
  updateApplication,
  type ApplicationFormState,
} from "@/app/actions/applications";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  WORK_MODE_LABELS,
  WORK_MODES,
  type Application,
} from "@/lib/applications";
import type { ApplicationField } from "@/lib/validation";
import { FormField, SelectField, TextareaField } from "./form-field";
import { FormAlert } from "./form-parts";
import { buttonStyles } from "./ui";

const initialState: ApplicationFormState = {};

const statusOptions = APPLICATION_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }));
const workModeOptions = [
  { value: "", label: "Sin especificar" },
  ...WORK_MODES.map((value) => ({ value, label: WORK_MODE_LABELS[value] })),
];

type Props = {
  /** Candidatura a editar; sin ella el formulario crea una nueva. */
  application?: Application;
  /** Fecha por defecto (aaaa-mm-dd) para una candidatura nueva. */
  defaultDay?: string;
  /** Referencia al <form>, para que el autorrelleno con IA escriba en los campos. */
  formRef?: Ref<HTMLFormElement>;
};

function initialValues(application: Application | undefined, defaultDay: string | undefined) {
  if (!application) {
    return { status: "aplicada", applied_on: defaultDay ?? "" } as Partial<Record<ApplicationField, string>>;
  }
  return {
    company: application.company,
    position: application.position,
    url: application.url ?? "",
    location: application.location ?? "",
    work_mode: application.work_mode ?? "",
    salary: application.salary ?? "",
    status: application.status,
    applied_on: application.applied_on ?? "",
    notes: application.notes ?? "",
  } satisfies Record<ApplicationField, string>;
}

export function ApplicationForm({ application, defaultDay, formRef }: Props) {
  const action = application ? updateApplication : createApplication;
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = state.values ?? initialValues(application, defaultDay);
  const errors = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-6">
      {application ? <input type="hidden" name="id" value={application.id} /> : null}
      <FormAlert message={state.formError} />
      {state.fieldErrors ? (
        <p role="alert" className="sr-only">
          Revisa los campos marcados.
        </p>
      ) : null}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">La oferta</legend>
        <FormField id="company" label="Empresa" defaultValue={values.company} error={errors.company} maxLength={200} required autoComplete="organization" />
        <FormField id="position" label="Puesto" defaultValue={values.position} error={errors.position} maxLength={200} required autoComplete="organization-title" />
        <div className="sm:col-span-2">
          <FormField
            id="url"
            label="Enlace a la oferta"
            type="url"
            placeholder="https://…"
            defaultValue={values.url}
            error={errors.url}
            maxLength={2000}
          />
        </div>
        <FormField id="location" label="Ubicación" placeholder="Madrid, Barcelona…" defaultValue={values.location} error={errors.location} maxLength={200} />
        <SelectField id="work_mode" label="Modalidad" options={workModeOptions} defaultValue={values.work_mode} error={errors.work_mode} />
        <FormField id="salary" label="Salario" placeholder="Ej.: 35.000–40.000 € brutos/año" defaultValue={values.salary} error={errors.salary} maxLength={200} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Seguimiento</legend>
        <SelectField id="status" label="Estado" options={statusOptions} defaultValue={values.status} error={errors.status} required />
        <FormField id="applied_on" label="Fecha de candidatura" type="date" defaultValue={values.applied_on} error={errors.applied_on} />
        <div className="sm:col-span-2">
          <TextareaField
            id="notes"
            label="Notas"
            placeholder="Contacto, próximos pasos, impresiones de la entrevista…"
            defaultValue={values.notes}
            error={errors.notes}
            maxLength={5000}
          />
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
        <Link href="/panel" className={buttonStyles.secondary}>
          Cancelar
        </Link>
        <button type="submit" disabled={pending} aria-busy={pending} className={buttonStyles.primary}>
          {pending ? "Guardando…" : application ? "Guardar cambios" : "Crear candidatura"}
        </button>
      </div>
    </form>
  );
}
