// apps/web/src/components/admin/AdminHeader.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { User, Bell } from 'lucide-react';

interface AdminHeaderProps {
  locale: string;
}

export default function AdminHeader({ locale }: AdminHeaderProps) {
  const t = useTranslations('Admin');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // 更新时间
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // 每分钟更新

    return () => clearInterval(interval);
  }, [locale]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧 - 页面标题会在各个页面中显示 */}
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {t('header.dashboard')}
            </h2>
          </div>

          {/* 右侧 - 用户信息和通知 */}
          <div className="flex items-center space-x-4">
            {/* 时间显示 */}
            <span className="text-sm text-gray-500 hidden sm:block">
              {currentTime}
            </span>

            {/* 通知图标（可选功能） */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
            </button>

            {/* 用户信息 */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <User size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('header.admin')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}