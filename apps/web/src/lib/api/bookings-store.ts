import { supabase } from './supabase/client';

export type BookingStatus = 'request' | 'pending' | 'paid' | 'cancelled' | 'failed' | 'confirmed';

export interface Booking {   // camelCase in TS
  id: string;
  propName: string;        
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  chargeDate: string | null;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  paymentIntentId?: string;
  beds24BookId?: string;
  approvedForCharge: boolean;
  manualReviewStatus: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  chargeMethod: 'immediate' | 'scheduled';
  rejectReason?: string;
  paidAt?: string;
}

// 字段映射
const FIELD_MAP = {     // conversion to snake_case in DB
  // TS (camelCase) -> DB (snake_case)
  propName: 'prop_name',
  guestName: 'guest_name',
  guestEmail: 'guest_email',
  checkIn: 'check_in',
  checkOut: 'check_out',
  totalPrice: 'total_price',
  createdAt: 'created_at',
  chargeDate: 'charge_date',
  stripeCustomerId: 'stripe_customer_id',
  stripePaymentMethodId: 'stripe_payment_method_id',
  paymentIntentId: 'payment_intent_id',
  beds24BookId: 'beds24_book_id',
  approvedForCharge: 'approved_for_charge',
  manualReviewStatus: 'manual_review_status',
  reviewedBy: 'reviewed_by',
  reviewedAt: 'reviewed_at',
  chargeMethod: 'charge_method',
  rejectReason: 'reject_reason',
  paidAt: 'paid_at'
};

// 反向映射（用于从数据库读取）
const FIELD_MAP_REVERSE = Object.entries(FIELD_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

// 转换函数
export function toDbFields(obj: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const dbKey = FIELD_MAP[key as keyof typeof FIELD_MAP] || key;
    result[dbKey] = value;
  }
  return result;
}

export function fromDbFields(obj: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const tsKey = FIELD_MAP_REVERSE[key] || key;
    result[tsKey] = value;
  }
  return result;
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase.from('bookings').select('*');
  if (error) {
    console.error('❌ getAllBookings error:', error.message);
    return [];
  }
  return data.map(fromDbFields) as Booking[];
}

export async function addBooking(newBooking: Booking) {
  const dbBooking = toDbFields(newBooking);
  const { error } = await supabase.from('bookings').insert([dbBooking]);
  if (error) {
    throw new Error(`Failed to insert booking: ${error.message}`);
  }
}

export async function updateBooking(id: string, updates: Partial<Booking>) {
  const dbUpdates = toDbFields(updates);
  const { error } = await supabase
    .from('bookings')
    .update(dbUpdates)
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
    .eq('approved_for_charge', true)
    .lte('charge_date', today);  // 使用 snake_case

  if (error) {
    console.error('❌ getPendingBookingsToCharge error:', error.message);
    return [];
  }
  return data.map(fromDbFields) as Booking[];
}

// 1. 获取待审核的订单
export async function getPendingReviewBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'request')
    .eq('manual_review_status', 'pending')
    .order('created_at', { ascending: true });  // 注意：应该是 created_at (snake_case)

  if (error) {
    console.error('❌ getPendingReviewBookings error:', error.message);
    return [];
  }
  return data.map(fromDbFields) as Booking[];  // 添加转换
}


// 2. 根据 ID 获取单个订单
export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('❌ getBookingById error:', error.message);
    return null;
  }
  return fromDbFields(data) as Booking;  // 添加转换
}

// 3. 更新订单审核状态（批准）
export async function updateBookingApproval(
  id: string, 
  approved: boolean, 
  reviewedBy: string
) {
  const updates = {
    approvedForCharge: approved,  // 使用 camelCase
    manualReviewStatus: approved ? 'approved' : 'rejected',
    reviewedBy: reviewedBy,
    reviewedAt: new Date().toISOString(),
    ...(approved && { status: 'pending' })
  };

  const dbUpdates = toDbFields(updates);  // 转换为 snake_case

  const { error } = await supabase
    .from('bookings')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update booking approval: ${error.message}`);
  }
}

// 4. 拒绝订单
export async function rejectBooking(
  id: string, 
  reviewedBy: string,
  rejectReason?: string
) {
  const updates = {
    status: 'cancelled' as BookingStatus,
    approvedForCharge: false,  // 使用 camelCase
    manualReviewStatus: 'rejected' as const,
    reviewedBy: reviewedBy,
    reviewedAt: new Date().toISOString(),
    rejectReason: rejectReason
  };

  const dbUpdates = toDbFields(updates);  // 转换为 snake_case

  const { error } = await supabase
    .from('bookings')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to reject booking: ${error.message}`);
  }
}

// 5. 获取已批准待扣款的订单（用于手动扣款页面）
export async function getApprovedImmediateCharges() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'pending')
    .eq('approved_for_charge', true)
    .eq('charge_method', 'immediate')
    .order('created_at', { ascending: true });  // 注意：应该是 created_at

  if (error) {
    console.error('❌ getApprovedImmediateCharges error:', error.message);
    return [];
  }
  return data.map(fromDbFields) as Booking[];  // 添加转换
}

// 6. 更新订单状态（通用函数）
export async function updateBookingStatus(
  id: string, 
  status: BookingStatus,
  additionalData?: any
) {
  const updates = {
    status,
    ...additionalData
  };

  const dbUpdates = toDbFields(updates);  // 添加转换

  const { error } = await supabase
    .from('bookings')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }
}