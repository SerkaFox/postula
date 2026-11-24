import { createClient } from "@/lib/supabase/server";
import { APPLICATION_COLUMNS, sortByDateDesc, type Application } from "./applications";

/** Candidaturas del usuario, la más reciente primero. RLS ya filtra; filtramos también por user_id. */
export async function listApplications(userId: string): Promise<Application[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("applications").select(APPLICATION_COLUMNS).eq("user_id", userId);
  if (error) throw new Error("No se han podido cargar tus candidaturas.");
  return sortByDateDesc((data ?? []) as Application[]);
}

/** Una candidatura del usuario, o null si no existe o no es suya. */
export async function getApplication(userId: string, id: string): Promise<Application | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATION_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("No se ha podido cargar la candidatura.");
  return data as Application | null;
}
