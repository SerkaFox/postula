import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApplicationForm } from "@/components/application-form";
import { DeleteApplicationButton } from "@/components/delete-application-button";
import { Card, FormPageShell, FormPageSkeleton } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { getApplication } from "@/lib/applications-data";
import { requireUser } from "@/lib/auth";
import { formatDateEs } from "@/lib/dates";
import { applicationIdSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Editar candidatura · Postula" };

export default function EditApplicationPage({ params }: PageProps<"/candidaturas/[id]">) {
  return (
    <Suspense fallback={<FormPageSkeleton label="Cargando candidatura…" />}>
      <EditApplication params={params} />
    </Suspense>
  );
}

async function EditApplication({ params }: { params: PageProps<"/candidaturas/[id]">["params"] }) {
  const user = await requireUser();
  const { id } = await params;
  const parsedId = applicationIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const application = await getApplication(user.id, parsedId.data);
  if (!application) notFound();

  const label = `${application.position} en ${application.company}`;
  return (
    <FormPageShell
      email={user.email}
      title={application.company}
      subtitle={
        <span className="inline-flex flex-wrap items-center gap-2">
          <span>{application.position}</span>
          <StatusBadge status={application.status} />
          <span className="text-zinc-500">
            Añadida el {formatDateEs(application.created_at)} · Actualizada el {formatDateEs(application.updated_at)}
          </span>
        </span>
      }
    >
      <Card>
        <ApplicationForm application={application} />
      </Card>
      <section aria-labelledby="zona-borrar" className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="zona-borrar" className="font-semibold text-zinc-900">
          Borrar candidatura
        </h2>
        <p className="mb-4 mt-1 text-sm text-zinc-600">Se eliminará con todas sus notas. Esta acción no se puede deshacer.</p>
        <DeleteApplicationButton id={application.id} label={label} goToPanel />
      </section>
    </FormPageShell>
  );
}
