import { NextRequest, NextResponse } from 'next/server';
import { getReferrerByCode } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'No referral code provided' },
        { status: 400 }
      );
    }

    const referrer = await getReferrerByCode(code);

    if (!referrer) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid referral code',
      });
    }

    return NextResponse.json({
      valid: true,
      referrer: {
        name: referrer.name,
        email: referrer.email,
      },
    });
  } catch (error) {
    console.error('Code validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
