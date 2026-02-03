import { createClient } from '@supabase/supabase-js';
import { Referrer, Referral, ReferralStatus } from './types';

// Get Supabase client
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
  }

  return createClient(url, key);
}

// Generate a unique referral code
export function generateReferralCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ref_${timestamp}_${random}`;
}

// Generate referral link from code
export function generateReferralLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/refer?ref=${code}`;
}

// Initialize database tables
export async function initDatabase() {
  const supabase = getSupabase();

  try {
    // Create referrers table
    const { error: referrersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS referrers (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          referral_code VARCHAR(100) UNIQUE NOT NULL,
          referral_link TEXT NOT NULL,
          total_referrals INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    });

    if (referrersError) {
      console.error('Error creating referrers table:', referrersError);
    }

    // Create referrals table
    const { error: referralsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS referrals (
          id VARCHAR(100) PRIMARY KEY,
          referrer_email VARCHAR(255) NOT NULL,
          referrer_name VARCHAR(255) NOT NULL,
          referred_email VARCHAR(255) NOT NULL,
          referred_name VARCHAR(255) NOT NULL,
          referred_phone VARCHAR(50),
          referred_child_grade VARCHAR(20),
          signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          purchase_date TIMESTAMP,
          reward_eligible_date TIMESTAMP,
          status VARCHAR(50) DEFAULT 'pending',
          reward_issued_date TIMESTAMP,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    });

    if (referralsError) {
      console.error('Error creating referrals table:', referralsError);
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

// ================== REFERRERS ==================

export async function getReferrers(): Promise<Referrer[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('referrers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referrers:', error);
    return [];
  }

  return (data || []).map(row => ({
    referral_code: row.referral_code,
    referral_link: row.referral_link,
    email: row.email,
    name: row.name,
    total_referrals: row.total_referrals,
    created_at: row.created_at,
  }));
}

export async function getReferrerByEmail(email: string): Promise<Referrer | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('referrers')
    .select('*')
    .eq('email', email.toLowerCase())
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    referral_code: data.referral_code,
    referral_link: data.referral_link,
    email: data.email,
    name: data.name,
    total_referrals: data.total_referrals,
    created_at: data.created_at,
  };
}

export async function getReferrerByCode(code: string): Promise<Referrer | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('referrers')
    .select('*')
    .eq('referral_code', code)
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    referral_code: data.referral_code,
    referral_link: data.referral_link,
    email: data.email,
    name: data.name,
    total_referrals: data.total_referrals,
    created_at: data.created_at,
  };
}

export async function createReferrer(email: string, name: string): Promise<Referrer> {
  const supabase = getSupabase();
  const normalizedEmail = email.toLowerCase();

  // Check if already exists
  const existing = await getReferrerByEmail(normalizedEmail);
  if (existing) {
    return existing;
  }

  const code = generateReferralCode();
  const link = generateReferralLink(code);

  const { data, error } = await supabase
    .from('referrers')
    .insert({
      email: normalizedEmail,
      name: name,
      referral_code: code,
      referral_link: link,
      total_referrals: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating referrer:', error);
    throw new Error('Failed to create referrer');
  }

  return {
    referral_code: code,
    referral_link: link,
    email: normalizedEmail,
    name: name,
    total_referrals: 0,
    created_at: data.created_at,
  };
}

export async function incrementReferrerCount(email: string): Promise<void> {
  const supabase = getSupabase();

  // First get current count
  const { data: current } = await supabase
    .from('referrers')
    .select('total_referrals')
    .eq('email', email.toLowerCase())
    .single();

  if (current) {
    await supabase
      .from('referrers')
      .update({ total_referrals: (current.total_referrals || 0) + 1 })
      .eq('email', email.toLowerCase());
  }
}

// ================== REFERRALS ==================

export async function getReferrals(): Promise<Referral[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    referrer_email: row.referrer_email,
    referrer_name: row.referrer_name,
    referred_email: row.referred_email,
    referred_name: row.referred_name,
    referred_phone: row.referred_phone || '',
    referred_child_grade: row.referred_child_grade || '',
    signup_date: row.signup_date,
    purchase_date: row.purchase_date || null,
    reward_eligible_date: row.reward_eligible_date || null,
    status: row.status as ReferralStatus,
    reward_issued_date: row.reward_issued_date || null,
    notes: row.notes || '',
    created_at: row.created_at,
  }));
}

export async function createReferral(
  referrer: Referrer,
  friendEmail: string,
  friendName: string,
  friendPhone: string,
  childGrade: string
): Promise<Referral> {
  const supabase = getSupabase();
  const id = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const { data, error } = await supabase
    .from('referrals')
    .insert({
      id,
      referrer_email: referrer.email,
      referrer_name: referrer.name,
      referred_email: friendEmail.toLowerCase(),
      referred_name: friendName,
      referred_phone: friendPhone,
      referred_child_grade: childGrade,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating referral:', error);
    throw new Error('Failed to create referral');
  }

  // Increment referrer's count
  await incrementReferrerCount(referrer.email);

  return {
    id,
    referrer_email: referrer.email,
    referrer_name: referrer.name,
    referred_email: friendEmail.toLowerCase(),
    referred_name: friendName,
    referred_phone: friendPhone,
    referred_child_grade: childGrade,
    signup_date: data.signup_date,
    purchase_date: null,
    reward_eligible_date: null,
    status: 'pending',
    reward_issued_date: null,
    notes: '',
    created_at: data.created_at,
  };
}

export async function updateReferralStatus(
  referralId: string,
  updates: Partial<Referral>
): Promise<Referral | null> {
  const supabase = getSupabase();

  const updateData: Record<string, unknown> = {};

  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }
  if (updates.purchase_date !== undefined) {
    updateData.purchase_date = updates.purchase_date;
  }
  if (updates.reward_eligible_date !== undefined) {
    updateData.reward_eligible_date = updates.reward_eligible_date;
  }
  if (updates.reward_issued_date !== undefined) {
    updateData.reward_issued_date = updates.reward_issued_date;
  }
  if (updates.notes !== undefined) {
    updateData.notes = updates.notes;
  }

  const { error } = await supabase
    .from('referrals')
    .update(updateData)
    .eq('id', referralId);

  if (error) {
    console.error('Error updating referral:', error);
    return null;
  }

  // Fetch and return updated referral
  return getReferralById(referralId);
}

export async function getReferralsByReferrer(email: string): Promise<Referral[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_email', email.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referrals by referrer:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    referrer_email: row.referrer_email,
    referrer_name: row.referrer_name,
    referred_email: row.referred_email,
    referred_name: row.referred_name,
    referred_phone: row.referred_phone || '',
    referred_child_grade: row.referred_child_grade || '',
    signup_date: row.signup_date,
    purchase_date: row.purchase_date || null,
    reward_eligible_date: row.reward_eligible_date || null,
    status: row.status as ReferralStatus,
    reward_issued_date: row.reward_issued_date || null,
    notes: row.notes || '',
    created_at: row.created_at,
  }));
}

export async function getReferralById(id: string): Promise<Referral | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('id', id)
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    referrer_email: data.referrer_email,
    referrer_name: data.referrer_name,
    referred_email: data.referred_email,
    referred_name: data.referred_name,
    referred_phone: data.referred_phone || '',
    referred_child_grade: data.referred_child_grade || '',
    signup_date: data.signup_date,
    purchase_date: data.purchase_date || null,
    reward_eligible_date: data.reward_eligible_date || null,
    status: data.status as ReferralStatus,
    reward_issued_date: data.reward_issued_date || null,
    notes: data.notes || '',
    created_at: data.created_at,
  };
}

// Get referral statistics
export async function getReferralStats() {
  const supabase = getSupabase();

  const { count: total } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true });

  const { count: pending } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: purchased } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'purchased');

  const { count: qualified } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'qualified');

  const { count: rewarded } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rewarded');

  const { count: disqualified } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'disqualified');

  return {
    total: total || 0,
    pending: pending || 0,
    purchased: purchased || 0,
    qualified: qualified || 0,
    rewarded: rewarded || 0,
    disqualified: disqualified || 0,
  };
}
