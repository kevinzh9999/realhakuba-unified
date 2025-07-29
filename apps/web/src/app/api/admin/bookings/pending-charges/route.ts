// apps/web/src/app/api/admin/bookings/pending-charges/route.ts
import { NextResponse } from 'next/server';
import { getApprovedImmediateCharges } from '@/lib/api/bookings-store';

export async function GET() {
  try {
    const bookings = await getApprovedImmediateCharges();
    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching pending charges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}