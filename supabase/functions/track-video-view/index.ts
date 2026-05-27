// Unified video view tracker.
// POST { video_id, viewer_session_id, source_type, source_id?, viewer_id?,
//        viewer_phone?, viewer_email?, watch_duration_seconds?, completed?,
//        country?, device_type? }
//
// Inserts a row into video_view_events. Becomes the single entry point for
// ALL view tracking across funnels / landing pages / courses / live sessions /
// direct shares. Frontend should POST on play start and on 25/50/75/100%
// milestones (each milestone = one row so completion ratio can be computed
// from rows, not just heartbeats).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_SOURCES = new Set([
  "funnel",
  "landing_page",
  "course",
  "live_session",
  "direct_share",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const {
    video_id,
    viewer_session_id,
    source_type,
    source_id,
    viewer_id,
    viewer_phone,
    viewer_email,
    watch_duration_seconds,
    completed,
    country,
    device_type,
    referrer,
    referrer_source,
    user_agent,
  } = body || {};

  if (!video_id || !viewer_session_id || !source_type) {
    return new Response(
      JSON.stringify({ error: "missing_required: video_id, viewer_session_id, source_type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!ALLOWED_SOURCES.has(source_type)) {
    return new Response(JSON.stringify({ error: "invalid_source_type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("video_view_events")
    .insert({
      video_id,
      viewer_session_id,
      session_id: viewer_session_id, // legacy column kept in sync
      source_type,
      source_id: source_id ?? null,
      viewer_id: viewer_id ?? null,
      viewer_user_id: viewer_id ?? null, // legacy column kept in sync
      viewer_phone: viewer_phone ?? null,
      viewer_email: viewer_email ?? null,
      watch_duration_seconds:
        typeof watch_duration_seconds === "number" ? Math.round(watch_duration_seconds) : null,
      duration_seconds: typeof watch_duration_seconds === "number" ? watch_duration_seconds : null,
      completed: completed === true,
      country: country ?? null,
      device_type: device_type ?? null,
      ip_address: ipAddress,
      referrer: referrer ?? null,
      referrer_source: referrer_source ?? null,
      user_agent: user_agent ?? req.headers.get("user-agent") ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[track-video-view] insert failed:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ logged: true, event_id: data?.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
