import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendWhatsAppMessage(
  supabaseUrl: string,
  serviceRoleKey: string,
  to: string,
  message_body: string,
) {
  const res = await fetch(`${supabaseUrl}/functions/v1/whatsapp-send-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({
      phone_number: to,
      message_body,
    }),
  });
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { automation_id, lead_phone, user_id, broadcast_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (automation_id && lead_phone) {
      const { data: enrollment } = await supabase
        .from("whatsapp_automation_enrollments")
        .select("*")
        .eq("automation_id", automation_id)
        .eq("lead_phone", lead_phone)
        .single();

      if (!enrollment) {
        return new Response(JSON.stringify({ error: "Enrollment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: automation } = await supabase
        .from("whatsapp_automations")
        .select("*")
        .eq("id", automation_id)
        .single();

      if (!automation) {
        return new Response(JSON.stringify({ error: "Automation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const steps = automation.sequence_steps || [];
      const currentStepIndex = enrollment.next_step_index;

      if (currentStepIndex >= steps.length) {
        await supabase
          .from("whatsapp_automation_enrollments")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", enrollment.id);

        return new Response(JSON.stringify({ sent: false, reason: "sequence_complete" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const currentStep = steps[currentStepIndex];

      const messageResult = await sendWhatsAppMessage(
        supabaseUrl,
        serviceRoleKey,
        lead_phone,
        currentStep.message_body || "",
      );

      if (messageResult.sent) {
        await supabase.from("whatsapp_message_logs").insert({
          user_id,
          lead_phone,
          direction: "outbound",
          message_type: "text",
          message_body: currentStep.message_body || "",
          automation_id,
          delivery_status: "sent",
          sent_at: new Date().toISOString(),
        });

        const nextIndex = currentStepIndex + 1;
        await supabase
          .from("whatsapp_automation_enrollments")
          .update({ next_step_index: nextIndex })
          .eq("id", enrollment.id);

        return new Response(
          JSON.stringify({
            sent: true,
            step_index: currentStepIndex,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } else {
        await supabase.from("whatsapp_message_logs").insert({
          user_id,
          lead_phone,
          direction: "outbound",
          message_type: "text",
          message_body: currentStep.message_body || "",
          automation_id,
          delivery_status: "failed",
          failure_reason: messageResult.error || "Unknown error",
          sent_at: new Date().toISOString(),
        });

        return new Response(JSON.stringify({ sent: false, error: messageResult.error }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (broadcast_id && user_id) {
      const { data: broadcast } = await supabase
        .from("whatsapp_broadcasts")
        .select("*")
        .eq("id", broadcast_id)
        .single();

      if (!broadcast) {
        return new Response(JSON.stringify({ error: "Broadcast not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: leads } = await supabase
        .from("whatsapp_leads")
        .select("*")
        .eq("user_id", user_id);

      let sent = 0;
      let failed = 0;

      for (const lead of leads || []) {
        const result = await sendWhatsAppMessage(
          supabaseUrl,
          serviceRoleKey,
          lead.phone_number,
          broadcast.message_body || "",
        );

        if (result.sent) {
          sent++;
          await supabase.from("whatsapp_message_logs").insert({
            user_id,
            lead_phone: lead.phone_number,
            direction: "outbound",
            message_type: "text",
            message_body: broadcast.message_body || "",
            broadcast_id,
            delivery_status: "sent",
            sent_at: new Date().toISOString(),
          });
        } else {
          failed++;
        }
      }

      await supabase
        .from("whatsapp_broadcasts")
        .update({
          total_sent: sent,
          total_failed: failed,
          status: "sent",
        })
        .eq("id", broadcast_id);

      return new Response(JSON.stringify({ sent, failed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("CRM runner error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
