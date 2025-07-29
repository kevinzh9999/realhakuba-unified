// app/[locale]/reservation/_components/loading-overlay.tsx
'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface LoadingOverlayProps {
  isOpen: boolean;
}

export function LoadingOverlay({ isOpen }: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('ReservationApp.ReservationPage');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-xl min-w-[280px]">
        {/* 三个跳动的圆点 */}
        <div className="flex justify-center space-x-3">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" 
               style={{ animationDelay: '0ms' }}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" 
               style={{ animationDelay: '150ms' }}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" 
               style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* 或者使用进度条样式 */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-progress"></div>
        </div>
        
        <p className="text-center mt-6 text-gray-700 font-medium">
          {t("processingRequest")}
        </p>
        <p className="text-center mt-2 text-sm text-gray-500">
          {t("pleaseWait")}
        </p>
      </div>
    </div>,
    document.body
  );
}