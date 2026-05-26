import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://nevorai.com";
const RESEND_FROM = "Nevorai <noreply@nevorai.com>";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function buildHtml(args: {
  creatorName: string;
  prospectName: string;
  prospectPhone: string;
  prospectEmail: string;
  pageTitle: string;
  istTime: string;
}) {
  const { creatorName, prospectName, prospectPhone, prospectEmail, pageTitle, istTime } = args;
  const row = (label: string, val: string) =>
    `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;width:90px;">${label}</td><td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:500;">${esc(val)}</td></tr>`;

  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;padding:36px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <tr><td>
        <div style="font-size:13px;font-weight:700;letter-spacing:0.2em;color:#2563eb;margin-bottom:24px;">NEVORAI</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#16a34a;margin-bottom:10px;">NEW LEAD</div>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 6px;line-height:1.3;">${esc(prospectName)} just filled your form</h1>
        <p style="font-size:14px;color:#64748b;margin:0 0 4px;">on <strong>${esc(pageTitle)}</strong></p>
        <p style="font-size:12px;color:#94a3b8;margin:0 0 20px;">${esc(istTime)} IST</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border-radius:10px;padding:8px 16px;margin:0 0 22px;">
          ${row("Name", prospectName)}
          ${row("Phone", prospectPhone)}
          ${row("Email", prospectEmail)}
        </table>
        <a href="${SITE}/admin/whatsapp" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:14px;margin:8px 0 20px;">View in Dashboard →</a>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;"/>
        <div style="font-size:11px;color:#94a3b8;line-height:1.6;">
          Sent to ${esc(creatorName)} · Nevorai · <a href="${SITE}" style="color:#94a3b8;text-decoration:underline;">nevorai.com</a>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const {
      owner_id,
      lead_name,
      lead_phone,
      lead_email,
      landing_page_id,
      landing_page_title,
    } = await req.json();

    if (!owner_id) {
      return new Response(JSON.stringify({ error: "owner_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, whatsapp_number, phone, whatsapp_verified")
      .eq("id", owner_id)
      .maybeSingle();

    const creatorEmail = (profile as any)?.email || null;
    const creatorName = (profile as any)?.full_name || "Creator";

    if (!creatorEmail) {
      return new Response(
        JSON.stringify({ sent: false, reason: "no_creator_email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!resendKey) {
      console.warn("[notify-creator-on-lead] RESEND_API_KEY not set");
      return new Response(
        JSON.stringify({ sent: false, reason: "no_resend_key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const istTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const prospectName = lead_name || "Someone";
    const pageTitle = landing_page_title || "your landing page";
    const html = buildHtml({
      creatorName,
      prospectName,
      prospectPhone: lead_phone || "—",
      prospectEmail: lead_email || "—",
      pageTitle,
      istTime,
    });

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [creatorEmail],
        subject: `New lead: ${prospectName}`,
        html,
      }),
    });
    const emailJson = await emailRes.json().catch(() => ({}));
    if (!emailRes.ok) {
      console.error("[notify-creator-on-lead] resend failed:", emailRes.status, emailJson);
    }

    // WhatsApp delivery is unreliable until template/24h-window fix is verified.
    // Keep the WhatsApp send disabled — re-enable once Meta Insights shows
    // Authentication-category delivery succeeding consistently.
    //
    // const creatorPhone =
    //   (profile as any)?.whatsapp_number || (profile as any)?.phone || null;
    // if (creatorPhone) {
    //   const text =
    //     `🎯 New lead on "${pageTitle}"\n\n` +
    //     `Name: ${prospectName}\n` +
    //     `Phone: ${lead_phone || "—"}\n` +
    //     `Email: ${lead_email || "—"}\n` +
    //     `Time: ${istTime} IST\n\n` +
    //     `View in nFlow Admin → WhatsApp → Leads`;
    //   await fetch(`${supabaseUrl}/functions/v1/whatsapp-send-text`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${serviceRoleKey}`,
    //     },
    //     body: JSON.stringify({
    //       to: String(creatorPhone).replace(/\D/g, ""),
    //       text,
    //     }),
    //   });
    // }

    return new Response(
      JSON.stringify({
        sent: emailRes.ok,
        transport: "email",
        creator_email: creatorEmail,
        upstream: emailJson,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("notify-creator-on-lead error:", err?.message);
    return new Response(JSON.stringify({ error: err?.message || "failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
