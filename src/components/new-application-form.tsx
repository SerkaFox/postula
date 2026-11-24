"use client";

import { useRef } from "react";
import { AiAutofill } from "./ai-autofill";
import { ApplicationForm } from "./application-form";
import { Card } from "./page-shell";

/** Alta de candidatura: panel de autorrelleno con IA (si está configurada) + formulario. */
export function NewApplicationForm({ defaultDay, aiEnabled }: { defaultDay: string; aiEnabled: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <>
      {aiEnabled ? <AiAutofill formRef={formRef} /> : null}
      <Card>
        <ApplicationForm defaultDay={defaultDay} formRef={formRef} />
      </Card>
    </>
  );
}
