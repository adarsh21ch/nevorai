-- ─── whatsapp_help_articles ──────────────────────────────────────
-- Knowledge base for the WhatsApp bot. When a user asks about HOW
-- a feature works, the bot finds the best-matching article and sends
-- a short, structured step-by-step answer. If the article has a linked
-- academy tutorial, the video is sent alongside.

CREATE TABLE IF NOT EXISTS public.whatsapp_help_articles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 text NOT NULL UNIQUE,         -- e.g. 'upload-video'
  title                text NOT NULL,                -- short title shown as the topic
  content              text NOT NULL,                -- step-by-step instructions
  keywords             text[] NOT NULL DEFAULT '{}', -- match keywords for intent detection
  academy_tutorial_id  uuid REFERENCES public.academy_tutorials(id) ON DELETE SET NULL,
  media_key            text,                         -- alternative to academy: reference to whatsapp_media.key
  is_published         boolean NOT NULL DEFAULT true,
  category             text NOT NULL DEFAULT 'general',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_help_articles_published ON public.whatsapp_help_articles(is_published, category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_help_articles_keywords ON public.whatsapp_help_articles USING GIN(keywords);

ALTER TABLE public.whatsapp_help_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage help articles" ON public.whatsapp_help_articles;
CREATE POLICY "Admins manage help articles"
  ON public.whatsapp_help_articles FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Service role manages help articles" ON public.whatsapp_help_articles;
CREATE POLICY "Service role manages help articles"
  ON public.whatsapp_help_articles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.tg_whatsapp_help_articles_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS whatsapp_help_articles_updated_at ON public.whatsapp_help_articles;
CREATE TRIGGER whatsapp_help_articles_updated_at
BEFORE UPDATE ON public.whatsapp_help_articles
FOR EACH ROW EXECUTE FUNCTION public.tg_whatsapp_help_articles_updated_at();

-- ─── Seed: 18 core Nevorai help articles ──────────────────────────
INSERT INTO public.whatsapp_help_articles (slug, title, content, keywords, category) VALUES

-- VIDEOS
('upload-video', 'How to upload a video',
'To upload a video on Nevorai:

1. Click "My Videos" in the sidebar
2. Tap the "Upload" button (top right)
3. Pick a video file from your device (MP4 works best)
4. Wait for the progress bar to finish
5. Your video appears in the library, ready to use in funnels

Tip: keep videos under 50 MB for fastest upload.',
ARRAY['upload','video','add video','upload video','new video','my videos','video upload'],
'videos'),

('youtube-import', 'How to import a YouTube video',
'To use a YouTube video in your funnel:

1. Go to "My Videos"
2. Click "Add via YouTube link"
3. Paste a public YouTube URL
4. Title and thumbnail are pulled automatically
5. Use it in any funnel just like an uploaded video',
ARRAY['youtube','youtube import','import youtube','add youtube link','youtube video'],
'videos'),

-- FUNNELS
('create-funnel', 'How to create your first funnel',
'To create a funnel:

1. Click "Tools" → "Funnels" in the sidebar
2. Tap "Create Funnel"
3. Give it a name (e.g. "My Sales Funnel")
4. Add steps one by one:
   • Video step (pick from My Videos)
   • Lead form (collect name, phone, email)
   • Testimonials (build trust)
   • WhatsApp message (auto-share)
   • Code gate (optional access code)
   • Landing page (post-conversion)
5. Click "Publish" — share the link anywhere',
ARRAY['create funnel','make funnel','build funnel','funnel builder','new funnel','first funnel'],
'funnels'),

('share-funnel', 'How to share your funnel',
'To share a funnel:

1. Open the funnel from "Tools → Funnels"
2. Click "Copy Link" or "Share on WhatsApp"
3. Paste the link in any chat, ad, or post

Anyone with the link can view the funnel — no signup needed for prospects.',
ARRAY['share funnel','copy funnel link','funnel link','share link','distribute funnel'],
'funnels'),

('skip-control', 'Why my video can be skipped (and how to lock it)',
'Each video step in a funnel has a "Skip Control" toggle:

1. Edit your funnel → click the video step
2. Find "Skip Control" / "Allow skip"
3. Turn it OFF to make the video unskippable
4. Save the step

Now prospects must watch the video fully before moving forward.',
ARRAY['skip','skip control','endout','end out','unskippable','can be skipped','no skip','watch fully'],
'funnels'),

('multi-step-funnel', 'Building a multi-step funnel',
'Multi-step funnels guide prospects through a journey:

1. Edit your funnel
2. Click "Add Step" at the bottom
3. Pick a step type (Video / Lead Form / Testimonials / WhatsApp / Code Gate / Landing)
4. Configure each step in order
5. Reorder by dragging
6. Publish

Each step shows only after the previous one is complete.',
ARRAY['multi step','multistep funnel','step funnel','add steps','funnel steps','journey'],
'funnels'),

-- LEAD CAPTURE
('lead-capture', 'How to capture leads from a funnel',
'Lead capture is done with a "Lead Form" step:

1. Edit your funnel
2. Click "Add Step" → pick "Lead Form"
3. Choose fields (name, phone, email — toggle required/optional)
4. Pick where the form appears (mid-video or end)
5. Save

Captured leads show in "Tools → Leads" with download as CSV.',
ARRAY['lead capture','capture lead','collect leads','lead form','lead form step','get leads'],
'leads'),

('view-leads', 'Where to see captured leads',
'To see your leads:

1. Open "Tools → Leads" in the sidebar
2. Use filters (date, funnel) to narrow down
3. Click any lead to see full details
4. Click "Export CSV" to download — limit depends on your plan',
ARRAY['view leads','my leads','see leads','export leads','download leads','lead list'],
'leads'),

-- LANDING PAGES
('create-landing-page', 'How to create a landing page',
'To create a landing page:

1. Go to "Tools → Landing Pages"
2. Click "Create Landing Page"
3. Add a title, description, CTA text, video
4. Customize the design with the live preview
5. Publish — you get a public URL like nevorai.com/l/your-page

You can also attach landing pages to funnels as the final step.',
ARRAY['landing page','create landing','make landing page','landing builder','build landing'],
'landing'),

-- LIVE SESSIONS
('go-live', 'How to host a live session',
'To go live:

1. Go to "Tools → Live"
2. Click "Schedule Live" or "Go Live Now"
3. Add title, description, time
4. Share the link with your audience
5. At session time, click "Start" — you are live!

Live sessions can also be added as a step inside a funnel.',
ARRAY['go live','live session','livestream','live broadcast','schedule live','start live'],
'live'),

-- BILLING
('start-trial', 'How does the free trial work',
'Every new user gets a 7-day free trial with full Pro access:

1. Sign up at nevorai.com — trial starts automatically
2. Use all features for 7 days (video funnels, landing pages, live sessions, leads)
3. Before the trial ends, choose a plan
4. After 7 days, the app shows an upgrade gate that must be paid to continue',
ARRAY['trial','free trial','start trial','trial period','how trial works','7 day trial'],
'billing'),

('upgrade-plan', 'How to upgrade your plan',
'To upgrade from Basic to Pro (or to a higher tier):

1. Open "Billing" or "Upgrade to Pro"
2. Pick the plan and tier (daily views)
3. The system calculates a prorated charge — you only pay the difference for remaining days
4. Pay securely via Razorpay (UPI/card/netbanking)
5. Your new limits apply instantly. Renewal date stays the same.',
ARRAY['upgrade','upgrade plan','move to pro','change plan','higher plan','prorated upgrade'],
'billing'),

('buy-extra-views', 'How to buy extra views (top-up)',
'When you are close to your view limit:

1. Open "Billing"
2. Find the "Top-up views" section
3. Pick how many extra views you need
4. Pay via Razorpay
5. Extra views are added immediately on top of your plan limit',
ARRAY['extra views','top up','buy views','more views','add views','view top-up'],
'billing'),

('renew-plan', 'How to renew your subscription',
'Plans renew automatically. If your card failed or you let it lapse:

1. Open "Billing"
2. Click "Renew now"
3. Pay via Razorpay — your plan continues from today
4. To enable auto-renew on yearly plans, choose the auto-renew option at checkout',
ARRAY['renew','renew plan','renew subscription','extend plan','reactivate plan'],
'billing'),

('cancel-subscription', 'How to cancel my subscription',
'To cancel:

1. Open "Billing"
2. Click "Cancel Subscription"
3. Confirm — your access continues until the end of the current billing period

You will not be charged again. You can resubscribe anytime.',
ARRAY['cancel','cancel subscription','unsubscribe','stop subscription','end plan','close account'],
'billing'),

('refund', 'Refund policy and how to request one',
'Refunds are case-by-case:

1. Reply to support with your registered email
2. Mention which payment you want refunded and why
3. Our team responds within 24 hours
4. If approved, refund is credited within 5-7 business days

For full policy: nevorai.com/refund-policy',
ARRAY['refund','money back','want refund','refund policy','reverse payment'],
'billing'),

-- BRANDING
('remove-watermark', 'How to remove the Nevorai watermark',
'The "Made with Nevorai" badge appears on free and Basic plans.

To remove it:

1. Upgrade to Pro
2. Go to "Settings" or your plan dashboard
3. Toggle off "Show Nevorai watermark"
4. Public funnel and landing pages no longer show the badge',
ARRAY['watermark','remove watermark','remove branding','hide watermark','made with nevorai','whitelabel'],
'branding'),

-- ACCOUNT
('reset-password', 'How to reset my password',
'To reset your password:

1. Go to nevorai.com/auth
2. Click "Forgot password"
3. Enter your registered email
4. Check your inbox for the reset link (also check spam)
5. Click the link and set a new password',
ARRAY['forgot password','reset password','password reset','cant login','recover password','change password'],
'account')

ON CONFLICT (slug) DO NOTHING;
