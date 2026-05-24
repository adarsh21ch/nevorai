-- ─── whatsapp_leads ───────────────────────────────────────────────
-- Every unknown WhatsApp phone that messages the bot becomes a lead.
-- The bot updates this row as it learns more (name, business, interest).
-- Admin sees these in /admin/whatsapp (Leads tab — coming in Phase 5).

CREATE TABLE IF NOT EXISTS public.whatsapp_leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number          text NOT NULL UNIQUE,

  -- Captured info (filled progressively from chat)
  name                  text,
  email                 text,
  business_type         text,
  interest              text CHECK (interest IS NULL OR interest IN ('nevorai','nevorai_call','both')),
  plan_interest         text CHECK (plan_interest IS NULL OR plan_interest IN ('basic','pro')),

  -- Pipeline tracking
  status                text NOT NULL DEFAULT 'new' CHECK (status IN ('new','engaged','qualified','demo_booked','converted','lost','cold')),
  score                 text NOT NULL DEFAULT 'cold' CHECK (score IN ('hot','warm','cold')),
  source                text NOT NULL DEFAULT 'whatsapp',

  -- Engagement metrics
  message_count         integer NOT NULL DEFAULT 0,
  asked_name_at         timestamptz,
  asked_business_at     timestamptz,
  asked_interest_at     timestamptz,
  first_message_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at       timestamptz NOT NULL DEFAULT now(),

  -- Conversion / handoff
  converted_to_user_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  converted_at          timestamptz,
  assigned_to           uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_notified_at     timestamptz,

  -- Free-text fields
  notes                 text,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_status        ON public.whatsapp_leads(status, score, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_phone         ON public.whatsapp_leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_assigned      ON public.whatsapp_leads(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_whatsapp_leads_last_message  ON public.whatsapp_leads(last_message_at DESC);

ALTER TABLE public.whatsapp_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage whatsapp leads" ON public.whatsapp_leads;
CREATE POLICY "Admins manage whatsapp leads"
  ON public.whatsapp_leads FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Service role manages whatsapp leads" ON public.whatsapp_leads;
CREATE POLICY "Service role manages whatsapp leads"
  ON public.whatsapp_leads FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.tg_whatsapp_leads_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS whatsapp_leads_updated_at ON public.whatsapp_leads;
CREATE TRIGGER whatsapp_leads_updated_at
BEFORE UPDATE ON public.whatsapp_leads
FOR EACH ROW EXECUTE FUNCTION public.tg_whatsapp_leads_updated_at();
