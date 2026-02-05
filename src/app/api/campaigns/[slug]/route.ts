import { NextRequest, NextResponse } from 'next/server';
import { getCampaignBySlug } from '@/lib/campaigns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const campaign = await getCampaignBySlug(slug);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or inactive' },
        { status: 404 }
      );
    }

    // Return only public-safe campaign data
    return NextResponse.json({
      campaign: {
        id: campaign.id,
        slug: campaign.slug,
        name: campaign.name,
        active: campaign.active,
        reward_amount: campaign.reward_amount,
        reward_type: campaign.reward_type,
        copy: campaign.copy,
        standard_fields: campaign.standard_fields,
        custom_fields: campaign.custom_fields,
      },
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}
