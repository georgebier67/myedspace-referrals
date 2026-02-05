import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, getPasswordFromCookie } from '@/lib/auth';
import { getReferrals, getReferrers } from '@/lib/data';

export async function GET(request: NextRequest) {
  // Check authentication
  const cookieHeader = request.headers.get('cookie');
  const password = getPasswordFromCookie(cookieHeader);

  if (!password || !validateAdminPassword(password)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'referrals';

  try {
    if (type === 'referrers') {
      const referrers = await getReferrers();
      const csv = generateReferrersCSV(referrers);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="referrers-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      const referrals = await getReferrals();
      const csv = generateReferralsCSV(referrals);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="referrals-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

interface Referral {
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
  status: string;
  reward_issued_date: string | null;
  notes: string;
  created_at: string;
}

interface Referrer {
  referral_code: string;
  referral_link: string;
  email: string;
  name: string;
  total_referrals: number;
  created_at: string;
}

function generateReferralsCSV(referrals: Referral[]): string {
  const headers = [
    'ID',
    'Referrer Name',
    'Referrer Email',
    'Friend Name',
    'Friend Email',
    'Friend Phone',
    'Child Grade',
    'Status',
    'Signup Date',
    'Purchase Date',
    'Reward Eligible Date',
    'Reward Issued Date',
    'Notes',
    'Created At',
  ];

  const rows = referrals.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.referrer_name),
    escapeCSV(r.referrer_email),
    escapeCSV(r.referred_name),
    escapeCSV(r.referred_email),
    escapeCSV(r.referred_phone),
    escapeCSV(r.referred_child_grade),
    escapeCSV(r.status),
    escapeCSV(r.signup_date),
    escapeCSV(r.purchase_date),
    escapeCSV(r.reward_eligible_date),
    escapeCSV(r.reward_issued_date),
    escapeCSV(r.notes),
    escapeCSV(r.created_at),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function generateReferrersCSV(referrers: Referrer[]): string {
  const headers = [
    'Name',
    'Email',
    'Referral Code',
    'Referral Link',
    'Total Referrals',
    'Created At',
  ];

  const rows = referrers.map((r) => [
    escapeCSV(r.name),
    escapeCSV(r.email),
    escapeCSV(r.referral_code),
    escapeCSV(r.referral_link),
    String(r.total_referrals),
    escapeCSV(r.created_at),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
