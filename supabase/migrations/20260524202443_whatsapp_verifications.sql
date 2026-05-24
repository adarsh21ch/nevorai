-- ─── whatsapp_verifications ───────────────────────────────────────
-- Tracks phone → user verifications.
-- A user proves they own a WhatsApp number by replying with the email
-- they registered with. We then store a 30-day verification so future
-- messages from that phone can access personal data (plan, views, etc.)
-- without re-verifying every time.

CREATE TABLE IF NOT EXISTS public.whatsapp_verifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number    text NOT NULL UNIQUE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verified_at     timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_phone
  ON public.whatsapp_verifications(phone_number, expires_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_user
  ON public.whatsapp_verifications(user_id);

ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read whatsapp verifications" ON public.whatsapp_verifications;
CREATE POLICY "Admins read whatsapp verifications"
  ON public.whatsapp_verifications FOR SELECT
  USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Users read own verification" ON public.whatsapp_verifications;
CREATE POLICY "Users read own verification"
  ON public.whatsapp_verifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages whatsapp verifications" ON public.whatsapp_verifications;
CREATE POLICY "Service role manages whatsapp verifications"
  ON public.whatsapp_verifications FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Extend whatsapp_conversations.reply_method to include "verification" and "personalized"
ALTER TABLE public.whatsapp_conversations
  DROP CONSTRAINT IF EXISTS whatsapp_conversations_reply_method_check;
ALTER TABLE public.whatsapp_conversations
  ADD CONSTRAINT whatsapp_conversations_reply_method_check
  CHECK (reply_method IN ('rule_based','ai','manual','template','none','verification','personalized'));
