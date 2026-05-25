// Admin-only retry of confirmation email for a landing page registration.
// JWT verification ON via supabase/config.toml.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const auth = req.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const token = auth.replace('Bearer ', '')
    const svc = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: userData, error: userErr } = await svc.auth.getUser(token)
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { data: isAdminData } = await svc.rpc('has_role', {
      _user_id: userData.user.id, _role: 'admin',
    })
    if (!isAdminData) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { registration_id } = await req.json()
    if (!registration_id) {
      return new Response(JSON.stringify({ error: 'registration_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: reg, error: regErr } = await svc
      .from('landing_page_registrations')
      .select('id, landing_page_id')
      .eq('id', registration_id)
      .maybeSingle()
    if (regErr || !reg) {
      return new Response(JSON.stringify({ error: 'Registration not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-landing-page-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_ROLE_KEY },
      body: JSON.stringify({
        registration_id: reg.id,
        landing_page_id: reg.landing_page_id,
      }),
    })
    const emailJson = await emailRes.json().catch(() => ({}))

    const delivery = {
      attempted: true,
      sent: !!emailJson?.sent,
      reason: emailJson?.sent ? 'ok' : (emailJson?.reason || emailJson?.error || `status_${emailRes.status}`),
      gmail_status: emailRes.status,
      resolved_plan_name: emailJson?.resolved_plan_name ?? null,
      timestamp: new Date().toISOString(),
      retried_by: userData.user.id,
    }

    await svc.from('landing_page_registrations')
      .update({ email_send_log: delivery })
      .eq('id', reg.id)

    return new Response(JSON.stringify({ success: true, email_delivery: delivery }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
