// One-shot backfill of video_assets.file_size_bytes.
// Walks video_assets where file_size_bytes IS NULL, fetches HEAD on
// public_url, reads Content-Length, and writes the value back.
//
// Usage: curl -X POST -H "apikey: <SERVICE_ROLE>" \
//   https://<project>.supabase.co/functions/v1/backfill-video-sizes
//
// Body (optional): { limit?: number, dry_run?: boolean }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_LIMIT = 200;
const CONCURRENCY = 5;

async function headSize(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return null;
    const len = res.headers.get("content-length");
    if (!len) return null;
    const n = Number(len);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch (e) {
    console.warn("[backfill-video-sizes] HEAD failed:", url, (e as Error).message);
    return null;
  }
}

async function processBatch<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency: number,
) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item === undefined) break;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: { limit?: number; dry_run?: boolean } = {};
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  const limit = Math.min(Math.max(Number(body.limit) || DEFAULT_LIMIT, 1), 1000);
  const dryRun = body.dry_run === true;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: rows, error } = await supabase
    .from("video_assets")
    .select("id, public_url")
    .is("file_size_bytes", null)
    .not("public_url", "is", null)
    .limit(limit);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const candidates = rows || [];
  const result = {
    scanned: candidates.length,
    updated: 0,
    skipped_no_header: 0,
    skipped_fetch_failed: 0,
    dry_run: dryRun,
  };

  await processBatch(
    candidates,
    async (row: any) => {
      const size = await headSize(row.public_url);
      if (size === null) {
        result.skipped_no_header++;
        return;
      }
      if (dryRun) {
        result.updated++;
        return;
      }
      const { error: upErr } = await supabase
        .from("video_assets")
        .update({ file_size_bytes: size })
        .eq("id", row.id);
      if (upErr) {
        console.error("[backfill-video-sizes] update failed:", row.id, upErr.message);
        result.skipped_fetch_failed++;
        return;
      }
      result.updated++;
    },
    CONCURRENCY,
  );

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
