import fs from 'fs';
import path from 'path';
import { Referrer, ReferrersStore, Referral } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const REFERRERS_FILE = path.join(DATA_DIR, 'referrers.json');
const REFERRALS_FILE = path.join(DATA_DIR, 'referrals.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
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

// ================== REFERRERS ==================

export function getReferrers(): ReferrersStore {
  ensureDataDir();
  if (!fs.existsSync(REFERRERS_FILE)) {
    fs.writeFileSync(REFERRERS_FILE, '{}');
    return {};
  }
  const data = fs.readFileSync(REFERRERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function saveReferrers(referrers: ReferrersStore): void {
  ensureDataDir();
  fs.writeFileSync(REFERRERS_FILE, JSON.stringify(referrers, null, 2));
}

export function getReferrerByEmail(email: string): Referrer | null {
  const referrers = getReferrers();
  return referrers[email.toLowerCase()] || null;
}

export function getReferrerByCode(code: string): Referrer | null {
  const referrers = getReferrers();
  return Object.values(referrers).find(r => r.referral_code === code) || null;
}

export function createReferrer(email: string, name: string): Referrer {
  const referrers = getReferrers();
  const normalizedEmail = email.toLowerCase();

  // Check if already exists
  if (referrers[normalizedEmail]) {
    return referrers[normalizedEmail];
  }

  const code = generateReferralCode();
  const referrer: Referrer = {
    referral_code: code,
    referral_link: generateReferralLink(code),
    email: normalizedEmail,
    name: name,
    total_referrals: 0,
    created_at: new Date().toISOString(),
  };

  referrers[normalizedEmail] = referrer;
  saveReferrers(referrers);

  return referrer;
}

export function incrementReferrerCount(email: string): void {
  const referrers = getReferrers();
  const normalizedEmail = email.toLowerCase();

  if (referrers[normalizedEmail]) {
    referrers[normalizedEmail].total_referrals += 1;
    saveReferrers(referrers);
  }
}

// ================== REFERRALS ==================

export function getReferrals(): Referral[] {
  ensureDataDir();
  if (!fs.existsSync(REFERRALS_FILE)) {
    fs.writeFileSync(REFERRALS_FILE, '[]');
    return [];
  }
  const data = fs.readFileSync(REFERRALS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function saveReferrals(referrals: Referral[]): void {
  ensureDataDir();
  fs.writeFileSync(REFERRALS_FILE, JSON.stringify(referrals, null, 2));
}

export function createReferral(
  referrer: Referrer,
  friendEmail: string,
  friendName: string,
  friendPhone: string,
  childGrade: string
): Referral {
  const referrals = getReferrals();

  const referral: Referral = {
    id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

  referrals.push(referral);
  saveReferrals(referrals);

  // Increment referrer's count
  incrementReferrerCount(referrer.email);

  return referral;
}

export function updateReferralStatus(
  referralId: string,
  updates: Partial<Referral>
): Referral | null {
  const referrals = getReferrals();
  const index = referrals.findIndex(r => r.id === referralId);

  if (index === -1) return null;

  referrals[index] = { ...referrals[index], ...updates };
  saveReferrals(referrals);

  return referrals[index];
}

export function getReferralsByReferrer(email: string): Referral[] {
  const referrals = getReferrals();
  return referrals.filter(r => r.referrer_email === email.toLowerCase());
}

export function getReferralById(id: string): Referral | null {
  const referrals = getReferrals();
  return referrals.find(r => r.id === id) || null;
}

// Get referral statistics
export function getReferralStats() {
  const referrals = getReferrals();

  return {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    purchased: referrals.filter(r => r.status === 'purchased').length,
    qualified: referrals.filter(r => r.status === 'qualified').length,
    rewarded: referrals.filter(r => r.status === 'rewarded').length,
    disqualified: referrals.filter(r => r.status === 'disqualified').length,
  };
}
