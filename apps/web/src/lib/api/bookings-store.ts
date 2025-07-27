import { supabase } from './supabase/client';

export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'failed';

export interface Booking {
  id: string;
  propName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  chargeDate: string | null; // checkIn - 30 days
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  paymentIntentId?: string;
  beds24BookId?: string;
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase.from('bookings').select('*');
  if (error) {
    console.error('❌ getAllBookings error:', error.message);
    return [];
  }
  return data as Booking[];
}

export async function addBooking(newBooking: Booking) {
  const { error } = await supabase.from('bookings').insert([newBooking]);
  if (error) {
    throw new Error(`Failed to insert booking: ${error.message}`);
  }
}

export async function updateBooking(id: string, updates: Partial<Booking>) {
  const { error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id);
  if (error) {
    throw new Error(`Failed to update booking: ${error.message}`);
  }
}

export async function getPendingBookingsToCharge(today: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'pending')
    .lte('chargeDate', today);

  if (error) {
    console.error('❌ getPendingBookingsToCharge error:', error.message);
    return [];
  }
  return data as Booking[];
}