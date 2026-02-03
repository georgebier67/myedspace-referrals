import { NextRequest, NextResponse } from 'next/server';
import { getReferrerByCode, createReferral } from '@/lib/data';
import { submitReferredFriendToHubSpot } from '@/lib/hubspot';
import { notifyNewReferral } from '@/lib/slack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, name, email, phone, childGrade } = body;

    // Validate input
    if (!referralCode || !name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Look up referrer by code
    const referrer = await getReferrerByCode(referralCode);
    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code. Please check your link and try again.' },
        { status: 400 }
      );
    }

    // Create referral record
    const referral = await createReferral(
      referrer,
      email,
      name,
      phone || '',
      childGrade || ''
    );

    // Submit to HubSpot (non-blocking)
    const hubspotResult = await submitReferredFriendToHubSpot(
      email,
      name,
      phone || '',
      referrer.email
    );

    if (!hubspotResult.success) {
      console.error('HubSpot submission failed:', hubspotResult.error);
    }

    // Send Slack notification (non-blocking)
    notifyNewReferral(referrer.name, name, email).catch(console.error);

    // Build redirect URL with UTMs
    const bookingUrl = process.env.BOOKING_URL || 'https://myedspace.com/pages/myedspace-learn-with-eddie';
    const redirectUrl = new URL(bookingUrl);
    redirectUrl.searchParams.set('utm_source', 'referral');
    redirectUrl.searchParams.set('utm_medium', 'friend_signup');
    redirectUrl.searchParams.set('utm_campaign', 'referral_program');
    redirectUrl.searchParams.set('ref', referralCode);

    return NextResponse.json({
      success: true,
      referral,
      redirectUrl: redirectUrl.toString(),
      message: 'Thank you for signing up!',
    });
  } catch (error) {
    console.error('Referral submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
