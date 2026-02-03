import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/data';

export async function GET() {
  try {
    const result = await initDatabase();

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to initialize database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
