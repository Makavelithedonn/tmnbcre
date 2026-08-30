// Supabase client for the public BeCaree website.
// This project intentionally shares the SAME backend as the insura-ops-insight
// dashboard project so accept/reject and live tracking work across both sites.
import { createClient } from "@supabase/supabase-js";

// Publishable (anon) credentials — safe to embed in browser code; access is
// governed by Row Level Security on the shared backend.
const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] ||
  process.env["SUPABASE_URL"] ||
  "https://ayyvwyniqgppumebjncd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  process.env["SUPABASE_PUBLISHABLE_KEY"] ||
  "sb_publishable_AChcd4vysZTRZ1kL_vd9AQ_Sv5uDyFt";

// New-style publishable keys are opaque strings, not JWTs: strip the
// Authorization header when it just echoes the key and always send `apikey`.
function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: undefined,
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
  },
});
