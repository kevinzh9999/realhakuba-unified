// apps/web/src/app/api/admin/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  updateBookingApproval, 
  rejectBooking, 
  getBookingById 
} from '@/lib/api/bookings-store';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, action, reviewedBy, rejectReason } = await request.json();
    
    // 获取订单信息
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    if (action === 'approve') {
        // 批准订单
        await updateBookingApproval(bookingId, true, reviewedBy);
        
        // 更新 Beds24 状态为 confirmed
        if (booking.beds24BookId) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/beds24/updatestatus`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookId: booking.beds24BookId,
                status: "1", // 1 = Confirmed
                propName: booking.propName  // 传递房源名称
              })
            });
            
            const result = await response.json();
            if (result.success) {
              console.log(`[ADMIN] Updated Beds24 booking ${booking.beds24BookId} to confirmed`);
            } else {
              console.error(`[ADMIN] Failed to update Beds24:`, result);
            }
          } catch (error) {
            console.error('[ADMIN] Failed to update Beds24 status:', error);
          }
        }
        
        console.log(`[ADMIN] Approved booking ${bookingId} by ${reviewedBy}`);
        
      } else if (action === 'reject') {
        // 拒绝订单
        await rejectBooking(bookingId, reviewedBy, rejectReason);
        
        // 更新 Beds24 状态为 cancelled
        if (booking.beds24BookId) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/beds24/updatestatus`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookId: booking.beds24BookId,
                status: "0", // 0 = Cancelled
                propName: booking.propName  // 传递房源名称
              })
            });
            
            const result = await response.json();
            if (result.success) {
              console.log(`[ADMIN] Updated Beds24 booking ${booking.beds24BookId} to cancelled`);
            } else {
              console.error(`[ADMIN] Failed to update Beds24:`, result);
            }
          } catch (error) {
            console.error('[ADMIN] Failed to update Beds24 status:', error);
          }
        }
        
        // TODO: send rejection email
        console.log(`[ADMIN] Rejected booking ${bookingId} by ${reviewedBy}. Reason: ${rejectReason}`);
      }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ADMIN] Approval API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}