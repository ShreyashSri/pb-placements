import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize database' },
      { status: 500 }
    );
  }
} 