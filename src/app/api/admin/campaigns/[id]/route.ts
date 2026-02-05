import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, getPasswordFromCookie } from '@/lib/auth';
import { getCampaignById, updateCampaign, deleteCampaign, DEFAULT_CAMPAIGN_ID } from '@/lib/campaigns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();

    const campaign = await updateCampaign(id, body);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 400 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Don't allow deleting the default campaign
    if (id === DEFAULT_CAMPAIGN_ID) {
      return NextResponse.json(
        { error: 'Cannot delete the default campaign' },
        { status: 400 }
      );
    }

    const success = await deleteCampaign(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete campaign. It may have existing referrers or referrals.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
