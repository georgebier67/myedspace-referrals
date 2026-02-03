import { neon } from '@neondatabase/serverless';
import { Referrer, Referral, ReferralStatus } from './types';

// Get SQL client - create fresh connection each time for serverless
function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(url);
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
  const sql = getSQL();
  try {
    // Create referrers table
    await sql`
      CREATE TABLE IF NOT EXISTS referrers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        referral_code VARCHAR(100) UNIQUE NOT NULL,
        referral_link TEXT NOT NULL,
        total_referrals INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create referrals table
    await sql`
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
    `;

    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

// ================== REFERRERS ==================

export async function getReferrers(): Promise<Referrer[]> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM referrers ORDER BY created_at DESC`;
  return rows.map(row => ({
    referral_code: row.referral_code,
    referral_link: row.referral_link,
    email: row.email,
    name: row.name,
    total_referrals: row.total_referrals,
    created_at: row.created_at?.toISOString() || new Date().toISOString(),
  }));
}

export async function getReferrerByEmail(email: string): Promise<Referrer | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM referrers WHERE email = ${email.toLowerCase()} LIMIT 1`;
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    referral_code: row.referral_code,
    referral_link: row.referral_link,
    email: row.email,
    name: row.name,
    total_referrals: row.total_referrals,
    created_at: row.created_at?.toISOString() || new Date().toISOString(),
  };
}

export async function getReferrerByCode(code: string): Promise<Referrer | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM referrers WHERE referral_code = ${code} LIMIT 1`;
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    referral_code: row.referral_code,
    referral_link: row.referral_link,
    email: row.email,
    name: row.name,
    total_referrals: row.total_referrals,
    created_at: row.created_at?.toISOString() || new Date().toISOString(),
  };
}

export async function createReferrer(email: string, name: string): Promise<Referrer> {
  const sql = getSQL();
  const normalizedEmail = email.toLowerCase();

  // Check if already exists
  const existing = await getReferrerByEmail(normalizedEmail);
  if (existing) {
    return existing;
  }

  const code = generateReferralCode();
  const link = generateReferralLink(code);

  await sql`
    INSERT INTO referrers (email, name, referral_code, referral_link, total_referrals)
    VALUES (${normalizedEmail}, ${name}, ${code}, ${link}, 0)
  `;

  return {
    referral_code: code,
    referral_link: link,
    email: normalizedEmail,
    name: name,
    total_referrals: 0,
    created_at: new Date().toISOString(),
  };
}

export async function incrementReferrerCount(email: string): Promise<void> {
  const sql = getSQL();
  await sql`
    UPDATE referrers
    SET total_referrals = total_referrals + 1
    WHERE email = ${email.toLowerCase()}
  `;
}

// ================== REFERRALS ==================

export async function getReferrals(): Promise<Referral[]> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM referrals ORDER BY created_at DESC`;
  return rows.map(row => ({
    id: row.id,
    referrer_email: row.referrer_email,
    referrer_name: row.referrer_name,
    referred_email: row.referred_email,
    referred_name: row.referred_name,
    referred_phone: row.referred_phone || '',
    referred_child_grade: row.referred_child_grade || '',
    signup_date: row.signup_date?.toISOString() || new Date().toISOString(),
    purchase_date: row.purchase_date?.toISOString() || null,
    reward_eligible_date: row.reward_eligible_date?.toISOString() || null,
    status: row.status as ReferralStatus,
    reward_issued_date: row.reward_issued_date?.toISOString() || null,
    notes: row.notes || '',
    created_at: row.created_at?.toISOString() || new Date().toISOString(),
  }));
}

export async function createReferral(
  referrer: Referrer,
  friendEmail: string,
  friendName: string,
  friendPhone: string,
  childGrade: string
): Promise<Referral> {
  const sql = getSQL();
  const id = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await sql`
    INSERT INTO referrals (
      id, referrer_email, referrer_name, referred_email, referred_name,
      referred_phone, referred_child_grade, status
    ) VALUES (
      ${id}, ${referrer.email}, ${referrer.name}, ${friendEmail.toLowerCase()},
      ${friendName}, ${friendPhone}, ${childGrade}, 'pending'
    )
  `;

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
    signup_date: new Date().toISOString(),
    purchase_date: null,
    reward_eligible_date: null,
    status: 'pending',
    reward_issued_date: null,
    notes: '',
    created_at: new Date().toISOString(),
  };
}

export async function updateReferralStatus(
  referralId: string,
  updates: Partial<Referral>
): Promise<Referral | null> {
  const sql = getSQL();

  // Build dynamic update query
  const setClauses: string[] = [];
  const values: (string | null | Date)[] = [];

  if (updates.status !== undefined) {
    await sql`UPDATE referrals SET status = ${updates.status} WHERE id = ${referralId}`;
  }
  if (updates.purchase_date !== undefined) {
    const purchaseDate = updates.purchase_date ? new Date(updates.purchase_date) : null;
    await sql`UPDATE referrals SET purchase_date = ${purchaseDate} WHERE id = ${referralId}`;
  }
  if (updates.reward_eligible_date !== undefined) {
    const eligibleDate = updates.reward_eligible_date ? new Date(updates.reward_eligible_date) : null;
    await sql`UPDATE referrals SET reward_eligible_date = ${eligibleDate} WHERE id = ${referralId}`;
  }
  if (updates.reward_issued_date !== undefined) {
    const issuedDate = updates.reward_issued_date ? new Date(updates.reward_issued_date) : null;
    await sql`UPDATE referrals SET reward_issued_date = ${issuedDate} WHERE id = ${referralId}`;
  }
  if (updates.notes !== undefined) {
    await sql`UPDATE referrals SET notes = ${updates.notes} WHERE id = ${referralId}`;
  }

  // Fetch and return updated referral
  return getReferralById(referralId);
}

export async function getReferralsByReferrer(email: string): Promise<Referral[]> {
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM referrals
    WHERE referrer_email = ${email.toLowerCase()}
    ORDER BY created_at DESC
  `;
  return rows.map(row => ({
    id: row.id,
    referrer_email: row.referrer_email,
    referrer_name: row.referrer_name,
    referred_email: row.referred_email,
    referred_name: row.referred_name,
    referred_phone: row.referred_phone || '',
    referred_child_grade: row.referred_child_grade || '',
    signup_date: row.signup_date?.toISOString() || new Date().toISOString(),
    purchase_date: row.purchase_date?.toISOString() || null,
    reward_eligible_date: row.reward_eligible_date?.toISOString() || null,
    status: row.status as ReferralStatus,
    reward_issued_date: row.reward_issued_date?.toISOString() || null,
    notes: row.notes || '',
    created_at: row.created_at?.toISOString() || new Date().toISOString(),
  }));
}

export async function getReferralById(id: string): Promise<Referral | null> {
  const sql = getSQL();
  const rows = await sql`SELECT * FROM referrals WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    referrer_email: row.referrer_email,
    referrer_name: row.referrer_name,
    referred_email: row.referred_email,
    referred_name: row.referred_name,
    referred_phone: row.referred_phone || '',
    referred_child_grade: row.referred_child_grade || '',
    signup_date: row.signup_date?.toISOString() || new Date().toISOString(),
    purchase_date: row.purchase_date?.toISOString() || null,
    reward_eligible_date: row.reward_eligible_date?.toISOString() || null,
    status: row.status as ReferralStatus,
    reward_issued_date: row.reward_issued_date?.toISOString() || null,
    notes: row.notes || '',
    created_at: row.created_at?.toISOString() || new Date().toISOString(),
  };
}

// Get referral statistics
export async function getReferralStats() {
  const sql = getSQL();

  const [total] = await sql`SELECT COUNT(*) as count FROM referrals`;
  const [pending] = await sql`SELECT COUNT(*) as count FROM referrals WHERE status = 'pending'`;
  const [purchased] = await sql`SELECT COUNT(*) as count FROM referrals WHERE status = 'purchased'`;
  const [qualified] = await sql`SELECT COUNT(*) as count FROM referrals WHERE status = 'qualified'`;
  const [rewarded] = await sql`SELECT COUNT(*) as count FROM referrals WHERE status = 'rewarded'`;
  const [disqualified] = await sql`SELECT COUNT(*) as count FROM referrals WHERE status = 'disqualified'`;

  return {
    total: Number(total.count),
    pending: Number(pending.count),
    purchased: Number(purchased.count),
    qualified: Number(qualified.count),
    rewarded: Number(rewarded.count),
    disqualified: Number(disqualified.count),
  };
}
