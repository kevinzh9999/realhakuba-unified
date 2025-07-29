// apps/web/src/components/admin/BookingReviewCard.tsx
'use client';

import { useState } from 'react';
import { Booking } from '@/lib/api/bookings-store';
import { Calendar, User, Mail, Home, DollarSign, Clock, AlertCircle } from 'lucide-react';

interface BookingReviewCardProps {
  booking: Booking;
  locale: string;
  onUpdate: (bookingId: string) => void;
}

export default function BookingReviewCard({ booking, locale, onUpdate }: BookingReviewCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 计算入住天数
  const calculateNights = () => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  // 批准订单
  const handleApprove = async () => {
    if (!confirm(`Approve booking for ${booking.guestName}?`)) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          action: 'approve',
          reviewedBy: 'admin@realhakuba.com' // TODO: 从session获取
        })
      });

      if (response.ok) {
        alert('Booking approved successfully!');
        onUpdate(booking.id);
      } else {
        alert('Failed to approve booking');
      }
    } catch (error) {
      alert('Error approving booking');
    } finally {
      setIsProcessing(false);
    }
  };

  // 拒绝订单
  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          action: 'reject',
          reviewedBy: 'admin@realhakuba.com', // TODO: 从session获取
          rejectReason
        })
      });

      if (response.ok) {
        alert('Booking rejected');
        setShowRejectModal(false);
        onUpdate(booking.id);
      } else {
        alert('Failed to reject booking');
      }
    } catch (error) {
      alert('Error rejecting booking');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* 客人信息 */}
          <div>
            <div className="flex items-center text-gray-600 mb-1">
              <User size={16} className="mr-1" />
              <span className="text-sm">Guest</span>
            </div>
            <p className="font-semibold">{booking.guestName}</p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Mail size={14} className="mr-1" />
              {booking.guestEmail}
            </p>
          </div>

          {/* 房源信息 */}
          <div>
            <div className="flex items-center text-gray-600 mb-1">
              <Home size={16} className="mr-1" />
              <span className="text-sm">Property</span>
            </div>
            <p className="font-semibold">{booking.propName}</p>
            <p className="text-sm text-gray-600">
              Booking ID: {booking.beds24BookId || booking.id.slice(0, 8)}
            </p>
          </div>

          {/* 日期信息 */}
          <div>
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar size={16} className="mr-1" />
              <span className="text-sm">Dates</span>
            </div>
            <p className="font-semibold">
              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
            </p>
            <p className="text-sm text-gray-600">
              {calculateNights()} nights
            </p>
          </div>

          {/* 金额信息 */}
          <div>
            <div className="flex items-center text-gray-600 mb-1">
              <DollarSign size={16} className="mr-1" />
              <span className="text-sm">Amount</span>
            </div>
            <p className="font-semibold text-xl">
              {booking.totalPrice.toLocaleString()} JPY
            </p>
            <div className="flex items-center mt-1">
              <Clock size={14} className="mr-1" />
              <span className={`text-sm px-2 py-1 rounded ${
                booking.chargeMethod === 'immediate' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {booking.chargeMethod === 'immediate' 
                  ? 'Immediate charge' 
                  : `Charge on ${formatDate(booking.chargeDate!)}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* 提交时间 */}
        <div className="mb-4 text-sm text-gray-600">
          Submitted on {formatDate(booking.createdAt)}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
          
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Reject
          </button>
        </div>
      </div>

      {/* 拒绝原因弹窗 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Reject Booking</h3>
            <p className="mb-4">
              Are you sure you want to reject the booking for {booking.guestName}?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border rounded-lg p-2"
                rows={3}
                placeholder="Enter reason..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              >
                {isProcessing ? 'Processing...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}