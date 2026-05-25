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

    const { user_id, trigger_type, lead_phone, trigger_data } = await req.json();

    if (!user_id || !trigger_type || !lead_phone) {
      return new Response(JSON.stringify({ error: "Missing params" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: automations, error: autoErr } = await supabase
      .from("whatsapp_automations")
      .select("*")
      .eq("user_id", user_id)
      .eq("trigger_type", trigger_type)
      .eq("status", "active");

    if (autoErr) throw autoErr;

    const enrolled = [];

    for (const automation of automations || []) {
      const { data: existing } = await supabase
        .from("whatsapp_automation_enrollments")
        .select("id")
        .eq("automation_id", automation.id)
        .eq("lead_phone", lead_phone)
        .single();

      if (existing) continue;

      const { data: enrollment, error: enrollErr } = await supabase
        .from("whatsapp_automation_enrollments")
        .insert({
          automation_id: automation.id,
          lead_phone,
          next_step_index: 0,
        })
        .select("id")
        .single();

      if (enrollErr) {
        console.error("Enrollment error:", enrollErr);
        continue;
      }

      enrolled.push({
        automation_id: automation.id,
        enrollment_id: enrollment.id,
      });
    }

    return new Response(JSON.stringify({ enrolled }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Auto enroll error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
