// apps/web/src/app/[locale]/admin/charge/page.tsx
import { getApprovedImmediateCharges } from '@/lib/api/bookings-store';
import ChargeList from '@/components/admin/ChargeList';

export default async function AdminChargePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // Next.js 15 要求 await params
  
  // 获取已批准的待扣款订单
  const bookings = await getApprovedImmediateCharges();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manual Charge Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Process payments for approved bookings that require immediate charging
        </p>
      </div>

      <ChargeList bookings={bookings} locale={locale} />
    </div>
  );
}