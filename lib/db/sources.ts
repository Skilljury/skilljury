import "server-only";

import { logDataAccessError, shouldUsePublicCatalogFallback } from "@/lib/db/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSourceCount() {
  try {
    const supabase = createServerSupabaseClient();
    const { count, error } = await supabase
      .from("sources")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) {
      throw error;
    }

    return count ?? 0;
  } catch (error) {
    logDataAccessError("source-count", error);

    if (shouldUsePublicCatalogFallback(error)) {
      return 0;
    }

    throw error;
  }
}
