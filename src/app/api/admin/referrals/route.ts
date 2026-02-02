import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword } from '@/lib/auth';
import { getReferrals, getReferralStats, getReferrers } from '@/lib/data';

export async function GET(request: NextRequest) {
  // Check authentication
  const password = request.cookies.get('admin_auth')?.value;
  if (!password || !validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const referrals = getReferrals();
    const stats = getReferralStats();
    const referrers = getReferrers();

    return NextResponse.json({
      referrals,
      stats,
      referrers: Object.values(referrers),
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}
