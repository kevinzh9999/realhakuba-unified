// apps/web/src/components/admin/BookingReviewList.tsx
'use client';

import { useState } from 'react';
import { Booking } from '@/lib/api/bookings-store';
import BookingReviewCard from './BookingReviewCard';

interface BookingReviewListProps {
  bookings: Booking[];
  locale: string;
}

export default function BookingReviewList({ bookings: initialBookings, locale }: BookingReviewListProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<'all' | 'immediate' | 'scheduled'>('all');

  // 过滤订单
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.charge_method === filter;
  });

  // 处理订单状态更新后的回调
  const handleBookingUpdate = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No pending bookings to review</p>
      </div>
    );
  }

  return (
    <div>
      {/* 过滤器 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('immediate')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'immediate' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Immediate ({bookings.filter(b => b.charge_method === 'immediate').length})
        </button>
        <button
          onClick={() => setFilter('scheduled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'scheduled' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Scheduled ({bookings.filter(b => b.charge_method === 'scheduled').length})
        </button>
      </div>

      {/* 订单列表 */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <BookingReviewCard
            key={booking.id}
            booking={booking}
            locale={locale}
            onUpdate={handleBookingUpdate}
          />
        ))}
      </div>
    </div>
  );
}