import { NextRequest, NextResponse } from 'next/server';
import { createReferrer, getReferrerByEmail } from '@/lib/data';
import { submitReferrerToHubSpot } from '@/lib/hubspot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
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

    // Check if referrer already exists
    const existingReferrer = await getReferrerByEmail(email);
    if (existingReferrer) {
      return NextResponse.json({
        success: true,
        referrer: existingReferrer,
        isExisting: true,
        message: 'Welcome back! Here is your existing referral link.',
      });
    }

    // Create new referrer
    const referrer = await createReferrer(email, name);

    // Submit to HubSpot (non-blocking - we don't fail if HubSpot fails)
    const hubspotResult = await submitReferrerToHubSpot(
      email,
      name,
      referrer.referral_link
    );

    if (!hubspotResult.success) {
      console.error('HubSpot submission failed:', hubspotResult.error);
      // We still return success since local storage worked
    }

    return NextResponse.json({
      success: true,
      referrer,
      isExisting: false,
      message: 'Your referral link has been created!',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
