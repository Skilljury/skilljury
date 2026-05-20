import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSourceCount() {
  const supabase = createServerSupabaseClient();
  const { count, error } = await supabase
    .from("sources")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[SkillJury:source-count] ${error.message}`);
    }

    return 0;
  }

  return count ?? 0;
}
