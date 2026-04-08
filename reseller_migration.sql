-- Reseller API System Migration

-- 1. Update app_role enum to include 'reseller'
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'reseller';

-- 2. Create reseller_api_keys table
CREATE TABLE IF NOT EXISTS public.reseller_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    api_key TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id) -- One active key per reseller for simplicity
);

-- Enable RLS on reseller_api_keys
ALTER TABLE public.reseller_api_keys ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all reseller api keys"
ON public.reseller_api_keys
FOR ALL
USING (
  public.has_role('admin', auth.uid())
)
WITH CHECK (
  public.has_role('admin', auth.uid())
);

-- Resellers can only view their own key (if needed by frontend, though admin generates it)
CREATE POLICY "Users can view own api key"
ON public.reseller_api_keys
FOR SELECT
USING (
  auth.uid() = user_id
);

-- 3. Add reseller_discount_percentage to site_settings (if not exists)
INSERT INTO public.site_settings (key, value)
VALUES ('reseller_discount_percentage', '10'::jsonb)
ON CONFLICT (key) DO NOTHING;
