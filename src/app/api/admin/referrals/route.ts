import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword } from '@/lib/auth';
import { getReferrals, getReferralStats, getReferrers } from '@/lib/data';
import { getCampaigns } from '@/lib/campaigns';

export async function GET(request: NextRequest) {
  // Check authentication
  const password = request.cookies.get('admin_auth')?.value;
  if (!password || !validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get campaign filter from query params
    const campaignId = request.nextUrl.searchParams.get('campaign') || undefined;

    const referrals = await getReferrals(campaignId);
    const stats = await getReferralStats(campaignId);
    const referrers = await getReferrers(campaignId);
    const campaigns = await getCampaigns();

    return NextResponse.json({
      referrals,
      stats,
      referrers,
      campaigns,
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}
