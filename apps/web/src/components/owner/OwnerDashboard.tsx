// apps/web/src/components/owner/OwnerDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LogOut, Home, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BookingCalendar from './BookingCalendar';

interface OwnerDashboardProps {
  propertyId: string;
  locale: string;
}

interface PropertyInfo {
  title: string;
  subtitle?: string;
  hero: string;
}

export default function OwnerDashboard({ propertyId, locale }: OwnerDashboardProps) {
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string || locale;

  useEffect(() => {
    loadPropertyInfo();
  }, [propertyId]);

  const loadPropertyInfo = async () => {
    try {
      const response = await fetch(`/api/owner/property-info?propertyId=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setPropertyInfo(data);
      }
    } catch (error) {
      console.error('Error loading property info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/owner/auth/logout', { method: 'POST' });
      if (response.ok) {
        // 使用router.push而不是window.location.href，这样可以保持SPA的行为
        router.push(`/${currentLocale}/login`);
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // 即使出错也尝试重定向
      router.push(`/${currentLocale}/login`);
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
            <Home className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {propertyInfo?.title || propertyId}
            </h1>
            {propertyInfo?.subtitle && (
              <p className="text-gray-600 mt-1">{propertyInfo.subtitle}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">物业ID: {propertyId}</p>
          </div>
        </div>
        
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              今日状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">可预订</div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date().toLocaleDateString('zh-CN')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              本月预订
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">-</div>
            <p className="text-xs text-gray-500 mt-1">
              加载中...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              本月收入
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">¥-</div>
            <p className="text-xs text-gray-500 mt-1">
              加载中...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 预订日历 */}
      <BookingCalendar propertyId={propertyId} />

      {/* 帮助信息 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• 日历显示您物业的所有预订情况</p>
          <p>• 不同颜色代表不同的预订来源（Airbnb、Booking.com等）</p>
          <p>• 点击预订条可查看详细信息</p>
          <p>• 使用左右箭头切换月份</p>
          <p>• 今日日期会用蓝色边框标记</p>
        </CardContent>
      </Card>
    </div>
  );
}