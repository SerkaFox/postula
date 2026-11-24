import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { ApplicationFilters } from "@/components/application-filters";
import { ApplicationList } from "@/components/application-list";
import { Notice } from "@/components/notice";
import { StatsOverview } from "@/components/stats-overview";
import { buttonStyles } from "@/components/ui";
import { filterApplications, panelHref, parseFilters } from "@/lib/applications";
import { listApplications } from "@/lib/applications-data";
import { requireUser } from "@/lib/auth";
import { isNoticeKey } from "@/lib/notices";
import { computeStats } from "@/lib/stats";

export const metadata: Metadata = { title: "Panel · Postula" };

export default function PanelPage({ searchParams }: PageProps<"/panel">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Panel searchParams={searchParams} />
    </Suspense>
  );
}

async function Panel({ searchParams }: { searchParams: PageProps<"/panel">["searchParams"] }) {
  // Comprobación en servidor: sin sesión redirige a /login.
  const user = await requireUser();
  const params = await searchParams;
  const filters = parseFilters(params);
  const notice = params.aviso;

  const applications = await listApplications(user.id);
  const stats = computeStats(applications, new Date());
  const visible = filterApplications(applications, filters);
  const filtering = filters.status !== null || filters.q !== "";

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Tu panel</h1>
            <p className="mt-1 text-sm text-zinc-600">Cómo va tu búsqueda de empleo, de un vistazo.</p>
          </div>
          <Link href="/candidaturas/nueva" className={buttonStyles.primary}>
            <span aria-hidden="true" className="text-base leading-none">+</span> Nueva candidatura
          </Link>
        </div>

        {isNoticeKey(notice) ? <Notice notice={notice} dismissHref={panelHref(filters)} /> : null}

        {applications.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StatsOverview stats={stats} />
            <section aria-labelledby="candidaturas" className="flex flex-col gap-4">
              <h2 id="candidaturas" className="text-lg font-semibold text-zinc-900">
                Candidaturas
              </h2>
              <ApplicationFilters filters={filters} counts={stats.byStatus} total={stats.total} />
              <p aria-live="polite" className="sr-only">
                {visible.length === 1 ? "1 candidatura" : `${visible.length} candidaturas`}
              </p>
              {visible.length > 0 ? (
                <ApplicationList applications={visible} />
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
                  <p className="font-medium text-zinc-800">No hay candidaturas que coincidan.</p>
                  <p className="mt-1 text-sm text-zinc-600">Prueba con otra búsqueda u otro estado.</p>
                  {filtering ? (
                    <Link href="/panel" className={`${buttonStyles.secondary} mt-4`}>
                      Quitar filtros
                    </Link>
                  ) : null}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-indigo-50 text-2xl text-indigo-600">
        ✦
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">Aún no tienes candidaturas</h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-600">
        Añade la primera oferta a la que te has apuntado y aquí verás tus totales, tu tasa de respuesta y la actividad de la semana.
      </p>
      <Link href="/candidaturas/nueva" className={`${buttonStyles.primary} mt-6`}>
        Añadir mi primera candidatura
      </Link>
    </section>
  );
}

function PanelSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-6xl px-4 py-8">
      <span className="sr-only">Cargando tu panel…</span>
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
        ))}
      </div>
      <div className="mt-4 h-24 animate-pulse rounded-2xl bg-zinc-200" />
      <div className="mt-6 h-64 animate-pulse rounded-2xl bg-zinc-200" />
    </div>
  );
}
