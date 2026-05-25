-- ─── whatsapp_media ───────────────────────────────────────────────
-- Stores rich media references (videos, images, PDFs) that the bot
-- can send via WhatsApp Cloud API. Media is sent by URL (Meta downloads
-- and forwards). Each media entry has a `key` so intents can reference
-- them ("demo_video", "brochure", etc.)

CREATE TABLE IF NOT EXISTS public.whatsapp_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,              -- e.g. 'demo_video', 'brochure', 'welcome_image'
  label       text NOT NULL,                     -- human-friendly name
  type        text NOT NULL CHECK (type IN ('video','image','document','audio')),
  url         text NOT NULL,                     -- publicly accessible URL (Supabase Storage, Cloudflare, etc.)
  caption     text,                              -- optional caption for image/video
  filename    text,                              -- for documents (PDFs)
  mime_type   text,
  is_active   boolean NOT NULL DEFAULT true,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_media_key ON public.whatsapp_media(key) WHERE is_active = true;

ALTER TABLE public.whatsapp_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage whatsapp media" ON public.whatsapp_media;
CREATE POLICY "Admins manage whatsapp media"
  ON public.whatsapp_media FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Service role manages whatsapp media" ON public.whatsapp_media;
CREATE POLICY "Service role manages whatsapp media"
  ON public.whatsapp_media FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.tg_whatsapp_media_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS whatsapp_media_updated_at ON public.whatsapp_media;
CREATE TRIGGER whatsapp_media_updated_at
BEFORE UPDATE ON public.whatsapp_media
FOR EACH ROW EXECUTE FUNCTION public.tg_whatsapp_media_updated_at();
