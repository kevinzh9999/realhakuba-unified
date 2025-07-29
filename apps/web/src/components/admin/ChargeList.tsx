// apps/web/src/components/admin/ChargeList.tsx
'use client';

import { useState } from 'react';
import { Booking } from '@/lib/api/bookings-store';
import ChargeCard from './ChargeCard';

interface ChargeListProps {
  bookings: Booking[];
  locale: string;
}

export default function ChargeList({ bookings: initialBookings, locale }: ChargeListProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // 计算总金额
  const totalAmount = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  // 处理扣款成功后的回调
  const handleChargeSuccess = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  // 处理扣款状态
  const setProcessing = (bookingId: string, isProcessing: boolean) => {
    setProcessingIds(prev => {
      const newSet = new Set(prev);
      if (isProcessing) {
        newSet.add(bookingId);
      } else {
        newSet.delete(bookingId);
      }
      return newSet;
    });
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No bookings pending charge</p>
      </div>
    );
  }

  return (
    <div>
      {/* 汇总信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-600 font-medium">Pending Charges</p>
            <p className="text-2xl font-bold text-blue-900">{bookings.length} bookings</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600 font-medium">Total Amount</p>
            <p className="text-2xl font-bold text-blue-900">
              ¥{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <ChargeCard
            key={booking.id}
            booking={booking}
            locale={locale}
            isProcessing={processingIds.has(booking.id)}
            onChargeSuccess={handleChargeSuccess}
            setProcessing={(isProcessing) => setProcessing(booking.id, isProcessing)}
          />
        ))}
      </div>
    </div>
  );
}