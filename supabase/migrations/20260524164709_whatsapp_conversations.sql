-- ─── whatsapp_conversations (inbound + outbound chat history) ─────
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number    text NOT NULL,
  direction       text NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_body    text,
  message_type    text NOT NULL DEFAULT 'text',
  meta_message_id text,
  status          text NOT NULL DEFAULT 'received',
  reply_method    text CHECK (reply_method IN ('rule_based','ai','manual','template','none')),
  ai_model        text,
  error_message   text,
  raw_payload     jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone
  ON public.whatsapp_conversations(phone_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_direction
  ON public.whatsapp_conversations(direction, created_at DESC);

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read whatsapp conversations" ON public.whatsapp_conversations;
CREATE POLICY "Admins read whatsapp conversations"
  ON public.whatsapp_conversations FOR SELECT
  USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Service role manages whatsapp conversations" ON public.whatsapp_conversations;
CREATE POLICY "Service role manages whatsapp conversations"
  ON public.whatsapp_conversations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
