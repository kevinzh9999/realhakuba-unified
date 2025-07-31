// apps/web/src/components/owner/BookingCalendar.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 预订来源配置
const BOOKING_SOURCES = {
  airbnb: { name: 'Airbnb', color: 'bg-red-500', textColor: 'text-white' },
  booking: { name: 'Booking.com', color: 'bg-blue-500', textColor: 'text-white' },
  agoda: { name: 'Agoda', color: 'bg-yellow-500', textColor: 'text-black' },
  direct: { name: '直接预订', color: 'bg-green-500', textColor: 'text-white' },
  other: { name: '其他', color: 'bg-gray-500', textColor: 'text-white' },
} as const;

type BookingSource = keyof typeof BOOKING_SOURCES;

interface Booking {
  id: string;
  guestName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  source: BookingSource;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalPrice?: number;
  guestCount?: number;
}

interface BookingCalendarProps {
  propertyId: string;
}

export default function BookingCalendar({ propertyId }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载预订数据
  useEffect(() => {
    loadBookings();
  }, [propertyId, currentDate]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await fetch(`/api/owner/bookings?propertyId=${propertyId}&year=${year}&month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        throw new Error('Failed to load bookings');
      }
    } catch (error) {
      setError('加载预订数据失败');
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前月份的日历数据
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 获取月份第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取第一周的开始日期（周日）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 生成5周的日期
    const weeks: Date[][] = [];
    for (let week = 0; week < 5; week++) {
      const weekDates: Date[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        weekDates.push(date);
      }
      weeks.push(weekDates);
    }
    
    return { weeks, currentMonth: month, currentYear: year };
  }, [currentDate]);

  // 获取某个日期的预订信息
  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = formatDate(date);
    return bookings.filter(booking => {
      return dateStr >= booking.checkIn && dateStr < booking.checkOut;
    });
  };

  // 获取跨越某个日期范围的预订
  const getBookingSpans = (weekDates: Date[]): Array<{
    booking: Booking;
    startCol: number;
    endCol: number;
    isStart: boolean;
    isEnd: boolean;
    row: number;
  }> => {
    const spans: Array<{
      booking: Booking;
      startCol: number;
      endCol: number;
      isStart: boolean;
      isEnd: boolean;
      row: number;
    }> = [];

    // 为每个预订分配行号，避免重叠
    const rowTracker: number[] = []; // 记录每列已使用的行数

    bookings.forEach(booking => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      
      // 计算预订在这一周的起始和结束位置
      let startCol = -1;
      let endCol = -1;
      
      weekDates.forEach((date, index) => {
        const dateStr = formatDate(date);
        if (dateStr === booking.checkIn) {
          startCol = index;
        }
        if (dateStr === booking.checkOut) {
          endCol = index - 1;
        }
      });
      
      // 如果预订跨越这一周
      if (checkInDate <= weekDates[6] && checkOutDate > weekDates[0]) {
        if (startCol === -1) startCol = 0; // 从本周开始
        if (endCol === -1) endCol = 6; // 到本周结束
        
        // 确保startCol和endCol在有效范围内
        startCol = Math.max(0, startCol);
        endCol = Math.min(6, endCol);

        // 找到合适的行位置
        let row = 0;
        for (let col = startCol; col <= endCol; col++) {
          if (!rowTracker[col]) rowTracker[col] = 0;
          row = Math.max(row, rowTracker[col]);
        }
        
        // 更新行跟踪器
        for (let col = startCol; col <= endCol; col++) {
          rowTracker[col] = row + 1;
        }
        
        spans.push({
          booking,
          startCol,
          endCol,
          isStart: formatDate(checkInDate) >= formatDate(weekDates[0]) && formatDate(checkInDate) <= formatDate(weekDates[6]),
          isEnd: formatDate(checkOutDate) >= formatDate(weekDates[0]) && formatDate(checkOutDate) <= formatDate(weekDates[6]),
          row,
        });
      }
    });

    return spans;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === calendarData.currentMonth;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-500">加载预订数据...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 图例 */}
      <Card>
        <CardHeader>
          <CardTitle>预订来源</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(BOOKING_SOURCES).map(([key, source]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${source.color}`}></div>
                <span className="text-sm">{source.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 日历 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>
                {calendarData.currentYear}年 {calendarData.currentMonth + 1}月
              </span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历周 */}
            {calendarData.weeks.map((weekDates, weekIndex) => {
              const weekSpans = getBookingSpans(weekDates);
              const maxRows = Math.max(1, Math.max(...weekSpans.map(s => s.row + 1), 0));

              return (
                <div key={weekIndex} className="relative" style={{ minHeight: `${64 + maxRows * 32}px` }}>
                  {/* 日期行 */}
                  <div className="grid grid-cols-7 gap-1 h-16 relative">
                    {weekDates.map((date, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`
                          border rounded-lg p-2 text-sm relative
                          ${isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                          ${formatDate(date) === formatDate(new Date()) ? 'ring-2 ring-blue-500' : ''}
                        `}
                      >
                        <span className="font-medium">{date.getDate()}</span>
                      </div>
                    ))}
                  </div>

                  {/* 预订跨度 */}
                  <div className="absolute inset-0 pointer-events-none top-16">
                    {weekSpans.map((span, index) => (
                      <div
                        key={`${span.booking.id}-${index}`}
                        className={`
                          absolute h-8 rounded-md px-2 py-1 text-xs font-medium
                          ${BOOKING_SOURCES[span.booking.source].color}
                          ${BOOKING_SOURCES[span.booking.source].textColor}
                          flex items-center justify-between
                          pointer-events-auto cursor-pointer
                          hover:opacity-90 transition-opacity
                          shadow-sm
                        `}
                        style={{
                          left: `${(span.startCol / 7) * 100}%`,
                          width: `${((span.endCol - span.startCol + 1) / 7) * 100}%`,
                          top: `${span.row * 32}px`,
                        }}
                        title={`${span.booking.guestName} - ${span.booking.checkIn} 到 ${span.booking.checkOut} - ${BOOKING_SOURCES[span.booking.source].name}`}
                      >
                        <span className="truncate">
                          {span.isStart ? span.booking.guestName : ''}
                        </span>
                        {span.isEnd && span.booking.totalPrice && (
                          <span className="ml-2 font-bold">
                            ¥{span.booking.totalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 预订统计 */}
      <Card>
        <CardHeader>
          <CardTitle>本月统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-500">确认预订</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">待确认</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ¥{bookings
                  .filter(b => b.status === 'confirmed')
                  .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">总收入</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {bookings
                  .filter(b => b.status === 'confirmed')
                  .reduce((sum, b) => sum + (b.guestCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">总客人数</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}