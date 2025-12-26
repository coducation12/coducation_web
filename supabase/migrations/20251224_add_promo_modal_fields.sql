-- Add promo_active and promo_image columns to content_management table
ALTER TABLE content_management 
ADD COLUMN IF NOT EXISTS promo_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promo_image TEXT;
