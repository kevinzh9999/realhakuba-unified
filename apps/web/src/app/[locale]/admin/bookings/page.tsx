// apps/web/src/app/[locale]/admin/bookings/page.tsx
import { getPendingReviewBookings } from '@/lib/api/bookings-store';
import BookingReviewList from '@/components/admin/BookingReviewList';
import { ReconcileSection } from '@/components/admin/ReconcileSection';

export default async function AdminBookingsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // Next.js 15 要求 await params
  
  // 获取待审核的订单
  const bookings = await getPendingReviewBookings();

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage bookings, review requests, and reconcile payment data
        </p>
      </div>

      {/* 数据对账工具 - 放在顶部作为管理工具 */}
      <div className="mb-8">
        <ReconcileSection />
      </div>

      {/* 分隔线 */}
      <div className="border-t pt-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Pending Booking Requests</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve booking requests from customers
        </p>
      </div>

      {/* 待审核订单列表 */}
      <BookingReviewList bookings={bookings} locale={locale} />
    </div>
  );
}