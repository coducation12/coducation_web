ALTER TABLE public.content_management
ADD COLUMN IF NOT EXISTS floating_banner_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS floating_banner_image TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS floating_banner_link TEXT DEFAULT NULL;
