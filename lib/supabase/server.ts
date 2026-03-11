import { createClient } from "@supabase/supabase-js";

import {
  getPublicSupabaseConfig,
  getServiceRoleConfig,
} from "@/lib/supabase/config";

export function createServerSupabaseClient() {
  const { url, anonKey } = getPublicSupabaseConfig();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServiceRoleSupabaseClient() {
  const { url, serviceRoleKey } = getServiceRoleConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
