// apps/web/src/components/admin/ChargeCard.tsx
'use client';

import { useState } from 'react';
import { Booking } from '@/lib/api/bookings-store';
import { 
  Calendar, 
  User, 
  Mail, 
  Home, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface ChargeCardProps {
  booking: Booking;
  locale: string;
  isProcessing: boolean;
  onChargeSuccess: (bookingId: string) => void;
  setProcessing: (processing: boolean) => void;
}

export default function ChargeCard({ 
  booking, 
  locale, 
  isProcessing,
  onChargeSuccess,
  setProcessing 
}: ChargeCardProps) {
  const [chargeResult, setChargeResult] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  // 🆕 添加状态防止重复点击
  const [hasBeenCharged, setHasBeenCharged] = useState(false);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 处理扣款
  const handleCharge = async () => {
    // 🆕 防止重复点击
    if (isProcessing || hasBeenCharged || chargeResult.type === 'success') {
      return;
    }

    if (!confirm(`Charge ¥${booking.totalPrice.toLocaleString()} for ${booking.guestName}?`)) {
      return;
    }

    setProcessing(true);
    setChargeResult({ type: null, message: '' });

    try {
      const response = await fetch('/api/admin/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      });

      const result = await response.json();

      if (result.success) {
        setHasBeenCharged(true);  // 🆕 标记为已扣款
        setChargeResult({
          type: 'success',
          message: result.message || `Payment successful! Amount: ¥${result.amount}`  // 🆕 显示后端返回的消息
        });
        
        // 延迟后从列表中移除
        setTimeout(() => {
          onChargeSuccess(booking.id);
        }, 2000);
      } else if (result.requiresAction) {
        // 需要 3D Secure 验证
        setChargeResult({
          type: 'error',
          message: 'This payment requires additional verification. Please contact the customer.'
        });
      } else if (result.status === 'processing') {  // 🆕 处理正在处理的状态
        setChargeResult({
          type: 'error',
          message: result.error || 'Payment is currently processing. Please wait.'
        });
      } else {
        setChargeResult({
          type: 'error',
          message: result.error || 'Payment failed'
        });
      }
    } catch (error: any) {
      setChargeResult({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  // 🆕 根据状态决定按钮文本和样式
  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <Loader2 size={20} className="mr-2 animate-spin" />
          Processing...
        </>
      );
    }
    
    if (chargeResult.type === 'success' || hasBeenCharged) {
      return (
        <>
          <CheckCircle size={20} className="mr-2" />
          Charged
        </>
      );
    }
    
    return (
      <>
        <CreditCard size={20} className="mr-2" />
        Charge ¥{booking.totalPrice.toLocaleString()}
      </>
    );
  };

  // 🆕 判断按钮是否应该被禁用
  const isButtonDisabled = isProcessing || chargeResult.type === 'success' || hasBeenCharged;

  return (
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
            ID: {booking.beds24BookId || booking.id.slice(0, 8)}
          </p>
        </div>

        {/* 日期信息 */}
        <div>
          <div className="flex items-center text-gray-600 mb-1">
            <Calendar size={16} className="mr-1" />
            <span className="text-sm">Check-in Date</span>
          </div>
          <p className="font-semibold">{formatDate(booking.checkIn)}</p>
          <p className="text-sm text-gray-600">
            Approved on {formatDate(booking.reviewedAt || booking.createdAt)}
          </p>
        </div>

        {/* 金额信息 */}
        <div>
          <div className="flex items-center text-gray-600 mb-1">
            <CreditCard size={16} className="mr-1" />
            <span className="text-sm">Amount to Charge</span>
          </div>
          <p className="font-semibold text-2xl text-green-600">
            ¥{booking.totalPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 支付方式信息 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Payment Method:</span> 
          <span className="ml-2">•••• {booking.stripePaymentMethodId?.slice(-4) || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Customer ID:</span> 
          <span className="ml-2">{booking.stripeCustomerId}</span>
        </p>
      </div>

      {/* 结果消息 */}
      {chargeResult.type && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          chargeResult.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {chargeResult.type === 'success' ? (
            <CheckCircle size={20} className="mr-2 flex-shrink-0" />
          ) : (
            <XCircle size={20} className="mr-2 flex-shrink-0" />
          )}
          <span>{chargeResult.message}</span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded">
          <AlertCircle size={16} className="mr-1" />
          <span>Immediate charge required</span>
        </div>

        <button
          onClick={handleCharge}
          disabled={isButtonDisabled}
          className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${
            isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
          }`}
        >
          {getButtonContent()}
        </button>
      </div>
    </div>
  );
}