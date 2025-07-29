// apps/web/src/app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPendingReviewBookings } from '@/lib/api/bookings-store';

export async function GET(request: NextRequest) {
  try {
    const bookings = await getPendingReviewBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}