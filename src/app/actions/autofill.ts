"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  AI_DAILY_LIMIT,
  AUTOFILL_ERRORS,
  AutofillError,
  autofillInputSchema,
  classifyInput,
  filledFields,
  normalizeExtraction,
  type AutofillField,
  type AutofillValues,
} from "@/lib/ai/autofill";
import { fetchOfferPage } from "@/lib/ai/fetch-page";
import { extractOfferWithGemini } from "@/lib/ai/gemini";
import { htmlToText } from "@/lib/ai/html-to-text";
import { createClient } from "@/lib/supabase/server";

export type AutofillResult =
  | { ok: true; values: AutofillValues; filled: AutofillField[]; remaining: number }
  | { ok: false; error: string };

/** Texto mínimo que debe tener una página descargada para intentar leerla. */
const MIN_PAGE_TEXT = 200;

/**
 * Lee una oferta (enlace o texto pegado) con Gemini y devuelve valores para el
 * formulario. No guarda la candidatura: el usuario revisa y guarda después.
 */
export async function autofillFromOffer(input: unknown): Promise<AutofillResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: AUTOFILL_ERRORS.session };

  const parsed = autofillInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? AUTOFILL_ERRORS.empty };
  const classified = classifyInput(parsed.data);
  if ("error" in classified) return { ok: false, error: AUTOFILL_ERRORS[classified.error] };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, error: AUTOFILL_ERRORS.not_configured };

  // Límite diario: la función de la base de datos cuenta y apunta el uso de forma
  // atómica (bloqueo por usuario), así que llamadas en paralelo no lo superan.
  const supabase = await createClient();
  const { data: remaining, error: quotaError } = await supabase.rpc("consume_ai_quota", { daily_limit: AI_DAILY_LIMIT });
  if (quotaError || typeof remaining !== "number") return { ok: false, error: AUTOFILL_ERRORS.ai_unavailable };
  if (remaining < 0) return { ok: false, error: AUTOFILL_ERRORS.quota };

  try {
    let offerText: string;
    let sourceUrl: string | null = null;
    if (classified.kind === "url") {
      const page = await fetchOfferPage(classified.url);
      offerText = htmlToText(page.html);
      sourceUrl = classified.url.href;
      if (offerText.replace(/\s+/g, "").length < MIN_PAGE_TEXT) throw new AutofillError("no_content");
    } else {
      offerText = classified.text;
    }

    const extraction = await extractOfferWithGemini(offerText, { apiKey, sourceUrl });
    if (extraction.es_oferta === false) {
      throw new AutofillError(classified.kind === "url" ? "page_not_offer" : "not_an_offer");
    }
    const values = normalizeExtraction(extraction, sourceUrl);
    const filled = filledFields(values);
    if (!values.company && !values.position) throw new AutofillError("nothing_found");
    return { ok: true, values, filled, remaining };
  } catch (err) {
    if (err instanceof AutofillError) return { ok: false, error: err.message };
    console.error("autofillFromOffer: error inesperado", err instanceof Error ? err.message : err);
    return { ok: false, error: AUTOFILL_ERRORS.ai_unavailable };
  }
}
