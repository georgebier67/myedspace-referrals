import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword } from '@/lib/auth';
import { deleteReferrer } from '@/lib/data';

export async function POST(request: NextRequest) {
  // Check authentication
  const password = request.cookies.get('admin_auth')?.value;
  if (!password || !validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const success = await deleteReferrer(email);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Referrer and associated referrals deleted',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete referrer' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting referrer:', error);
    return NextResponse.json(
      { error: 'Failed to delete referrer' },
      { status: 500 }
    );
  }
}
