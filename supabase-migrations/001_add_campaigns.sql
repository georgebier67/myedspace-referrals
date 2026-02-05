-- =============================================
-- CAMPAIGN SYSTEM MIGRATION
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  reward_amount VARCHAR(50) NOT NULL DEFAULT '$150',
  reward_type VARCHAR(100) NOT NULL DEFAULT 'Amazon Gift Card',
  hubspot_portal_id VARCHAR(50),
  hubspot_form_guid VARCHAR(100),
  copy JSONB NOT NULL DEFAULT '{
    "referrer_page_title": "Refer a Friend",
    "referrer_page_subtitle": "Share MyEdSpace with friends and earn rewards!",
    "referrer_form_heading": "Get Your Referral Link",
    "referrer_success_title": "You''re In!",
    "referrer_success_message": "Share your unique link with friends to start earning rewards.",
    "friend_page_title": "Welcome!",
    "friend_page_subtitle": "Your friend thinks you''ll love MyEdSpace",
    "friend_form_heading": "Sign Up for Your Free Trial",
    "friend_success_title": "Thanks for signing up!",
    "friend_success_message": "We''ll be in touch soon to get you started.",
    "reward_description": "Get a $150 Amazon Gift Card for each friend who stays for 30 days!",
    "terms_content": "Standard terms and conditions apply."
  }'::jsonb,
  standard_fields JSONB NOT NULL DEFAULT '{"phone": true, "child_grade": true}'::jsonb,
  custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add campaign_id to referrers table
ALTER TABLE referrers
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);

-- 3. Add campaign_id and custom_fields to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);

ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- 4. Create default campaign (migrates existing data)
INSERT INTO campaigns (
  id,
  slug,
  name,
  active,
  reward_amount,
  reward_type,
  hubspot_portal_id,
  hubspot_form_guid,
  copy,
  standard_fields,
  custom_fields
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'refer-a-friend',
  'Refer a Friend (Default)',
  true,
  '$150',
  'Amazon Gift Card',
  NULL, -- Will be set from env vars at runtime
  NULL, -- Will be set from env vars at runtime
  '{
    "referrer_page_title": "Refer a Friend to MyEdSpace",
    "referrer_page_subtitle": "Know someone who could use expert tutoring? Share MyEdSpace and earn rewards when they sign up!",
    "referrer_form_heading": "Get Your Unique Referral Link",
    "referrer_success_title": "You''re All Set!",
    "referrer_success_message": "Share your unique referral link with friends. When they sign up and stay for 30 days, you''ll receive your reward!",
    "friend_page_title": "Your Friend Thinks You''ll Love MyEdSpace!",
    "friend_page_subtitle": "Get started with expert tutoring today",
    "friend_form_heading": "Sign Up for Your Free Trial",
    "friend_success_title": "Thanks for signing up!",
    "friend_success_message": "We''ll redirect you to book your first session.",
    "reward_description": "Get a $150 Amazon Gift Card for each friend who signs up and stays for 30 days!",
    "terms_content": "By participating in this referral program, you agree to our terms and conditions. Rewards are issued after the referred friend completes 30 days as a paying customer."
  }'::jsonb,
  '{"phone": true, "child_grade": true}'::jsonb,
  '[]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- 5. Update existing referrers to use default campaign
UPDATE referrers
SET campaign_id = '00000000-0000-0000-0000-000000000001'
WHERE campaign_id IS NULL;

-- 6. Update existing referrals to use default campaign
UPDATE referrals
SET campaign_id = '00000000-0000-0000-0000-000000000001'
WHERE campaign_id IS NULL;

-- 7. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrers_campaign_id ON referrers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_referrals_campaign_id ON referrals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(active);

-- 8. Create updated_at trigger for campaigns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
