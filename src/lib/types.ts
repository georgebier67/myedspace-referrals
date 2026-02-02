// Referrer data structure
export interface Referrer {
  referral_code: string;
  referral_link: string;
  email: string;
  name: string;
  total_referrals: number;
  created_at: string;
}

// Referrers storage (keyed by email for simplicity since no HubSpot lookup)
export interface ReferrersStore {
  [email: string]: Referrer;
}

// Referral status types
export type ReferralStatus =
  | 'pending'      // Friend signed up, waiting for purchase
  | 'purchased'    // Purchase made, waiting for 30-day window
  | 'qualified'    // 30 days passed, eligible for reward
  | 'rewarded'     // Reward has been issued
  | 'disqualified'; // Refunded or cancelled

// Individual referral data
export interface Referral {
  id: string;
  referrer_email: string;
  referrer_name: string;
  referred_email: string;
  referred_name: string;
  referred_phone: string;
  referred_child_grade: string;
  signup_date: string;
  purchase_date: string | null;
  reward_eligible_date: string | null;
  status: ReferralStatus;
  reward_issued_date: string | null;
  notes: string;
  created_at: string;
}
