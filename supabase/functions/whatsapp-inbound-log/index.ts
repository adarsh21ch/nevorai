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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { user_id, phone_number, message_body, whatsapp_message_id, timestamp } =
      await req.json();

    if (!user_id || !phone_number || !message_body) {
      return new Response(JSON.stringify({ error: "Missing params" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let { data: lead } = await supabase
      .from("whatsapp_leads")
      .select("id")
      .eq("user_id", user_id)
      .eq("phone_number", phone_number)
      .single();

    if (!lead) {
      const { data: newLead } = await supabase
        .from("whatsapp_leads")
        .insert({
          user_id,
          phone_number,
          status: "active",
          source: "inbound_message",
        })
        .select("id")
        .single();

      lead = newLead;
    }

    const { data: log } = await supabase
      .from("whatsapp_message_logs")
      .insert({
        user_id,
        lead_phone: phone_number,
        direction: "inbound",
        message_type: "text",
        message_body,
        whatsapp_message_id,
        delivery_status: "delivered",
        delivered_at: new Date(timestamp * 1000).toISOString(),
      })
      .select("id")
      .single();

    await supabase
      .from("whatsapp_leads")
      .update({
        last_contacted_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    return new Response(
      JSON.stringify({
        logged: true,
        lead_id: lead.id,
        log_id: log.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("Inbound log error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
