import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { owner_id, lead_name, lead_phone, lead_email, landing_page_id, landing_page_title } =
      await req.json();

    if (!owner_id) {
      return new Response(JSON.stringify({ error: "owner_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp_number, phone, whatsapp_verified")
      .eq("id", owner_id)
      .maybeSingle();

    const creatorPhone = (profile as any)?.whatsapp_number || (profile as any)?.phone || null;

    if (!creatorPhone) {
      return new Response(JSON.stringify({ sent: false, reason: "no_creator_phone" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const istTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const pageTitle = landing_page_title || "your landing page";
    const text =
      `🎯 New lead on "${pageTitle}"\n\n` +
      `Name: ${lead_name || "—"}\n` +
      `Phone: ${lead_phone || "—"}\n` +
      `Email: ${lead_email || "—"}\n` +
      `Time: ${istTime} IST\n\n` +
      `View in nFlow Admin → WhatsApp → Leads`;

    const sendRes = await fetch(`${supabaseUrl}/functions/v1/whatsapp-send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        to: String(creatorPhone).replace(/\D/g, ""),
        text,
      }),
    });

    const sendJson = await sendRes.json().catch(() => ({}));

    return new Response(
      JSON.stringify({
        sent: sendRes.ok,
        creator_phone: creatorPhone,
        upstream: sendJson,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("notify-creator-on-lead error:", err?.message);
    return new Response(JSON.stringify({ error: err?.message || "failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
