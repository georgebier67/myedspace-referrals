import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, getPasswordFromCookie } from '@/lib/auth';
import { getCampaigns, createCampaign, getCampaignStats } from '@/lib/campaigns';

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

  try {
    const campaigns = await getCampaigns();

    // Get stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const stats = await getCampaignStats(campaign.id);
        return { ...campaign, stats };
      })
    );

    return NextResponse.json({ campaigns: campaignsWithStats });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const cookieHeader = request.headers.get('cookie');
  const password = getPasswordFromCookie(cookieHeader);

  if (!password || !validateAdminPassword(password)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { slug, name, reward_amount, reward_type, hubspot_portal_id, hubspot_form_guid, copy, standard_fields, custom_fields } = body;

    if (!slug || !name || !reward_amount || !reward_type) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, name, reward_amount, reward_type' },
        { status: 400 }
      );
    }

    const campaign = await createCampaign({
      slug,
      name,
      reward_amount,
      reward_type,
      hubspot_portal_id,
      hubspot_form_guid,
      copy,
      standard_fields,
      custom_fields,
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Failed to create campaign. Slug may already exist.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
