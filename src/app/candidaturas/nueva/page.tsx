import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationForm } from "@/components/application-form";
import { Card, FormPageShell, FormPageSkeleton } from "@/components/page-shell";
import { requireUser } from "@/lib/auth";
import { toDayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Nueva candidatura · Postula" };

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<FormPageSkeleton label="Cargando formulario…" />}>
      <NewApplication />
    </Suspense>
  );
}

async function NewApplication() {
  const user = await requireUser();
  return (
    <FormPageShell email={user.email} title="Nueva candidatura" subtitle="Los campos con * son obligatorios.">
      <Card>
        <ApplicationForm defaultDay={toDayKey(new Date())} />
      </Card>
    </FormPageShell>
  );
}
