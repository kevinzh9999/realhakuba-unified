// apps/web/src/components/owner/BookingCalendar.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  checkOut: string; // YYYY-MM-DD (beds24 lastNight)
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
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
      // 计算真正的退房日期
      const checkOutDate = new Date(booking.checkOut + 'T00:00:00');
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      const correctCheckOutStr = formatDate(checkOutDate);
      
      return dateStr >= booking.checkIn && dateStr < correctCheckOutStr;
    });
  };

  // 计算预订条的位置和宽度
  const calculateBookingPosition = (
    booking: Booking, 
    weekDates: Date[], 
    startCol: number, 
    endCol: number,
    isStart: boolean,
    isEnd: boolean
  ) => {
    let left = (startCol / 7) * 100;
    let width = ((endCol - startCol + 1) / 7) * 100;
    
    // 如果是入住日，从该日期的50%开始
    if (isStart) {
      const adjustment = (1 / 7) * 100 * 0.5;
      left += adjustment;
      width -= adjustment;
    }
    
    // 如果是退房日，在该日期的50%结束
    if (isEnd) {
      const adjustment = (1 / 7) * 100 * 0.5;
      width -= adjustment;
    }
    
    return { left, width };
  };

  // 获取跨越某个日期范围的预订 - 修改为不分行显示
  const getBookingSpans = (weekDates: Date[]): Array<{
    booking: Booking;
    startCol: number;
    endCol: number;
    isStart: boolean;
    isEnd: boolean;
    position: { left: number; width: number };
  }> => {
    const spans: Array<{
      booking: Booking;
      startCol: number;
      endCol: number;
      isStart: boolean;
      isEnd: boolean;
      position: { left: number; width: number };
    }> = [];

    bookings.forEach(booking => {
      const checkInStr = booking.checkIn;
      
      // 从 beds24 数据计算正确的退房日期
      const checkOutDate = new Date(booking.checkOut + 'T00:00:00');
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      const correctCheckOutStr = formatDate(checkOutDate);
      
      if (!checkInStr || !booking.checkOut) return;
      
      // 计算预订在这一周的起始和结束位置
      let startCol = -1;
      let endCol = -1;
      
      weekDates.forEach((date, index) => {
        const dateStr = formatDate(date);
        if (dateStr === checkInStr) {
          startCol = index;
        }
        if (dateStr === correctCheckOutStr) {
          endCol = index;
        }
      });
      
      // 检查预订是否跨越这一周
      const weekStartStr = formatDate(weekDates[0]);
      const weekEndStr = formatDate(weekDates[6]);
      
      const bookingOverlapsWeek = (checkInStr <= weekEndStr && correctCheckOutStr >= weekStartStr);
      
      if (bookingOverlapsWeek) {
        const isRealStart = startCol !== -1;
        const isRealEnd = endCol !== -1;
        
        // 如果预订从之前开始，从第0列开始
        if (startCol === -1 && checkInStr < weekStartStr) {
          startCol = 0;
        }
        // 如果预订延续到下周，到第6列结束
        if (endCol === -1 && correctCheckOutStr > weekEndStr) {
          endCol = 6;
        }
        
        // 确保startCol和endCol在有效范围内
        startCol = Math.max(0, startCol);
        endCol = Math.min(6, endCol);
        
        // 只有当startCol <= endCol时才显示
        if (startCol <= endCol) {
          // 计算位置
          const position = calculateBookingPosition(
            booking, 
            weekDates, 
            startCol, 
            endCol, 
            isRealStart, 
            isRealEnd
          );
          
          spans.push({
            booking,
            startCol,
            endCol,
            isStart: isRealStart,
            isEnd: isRealEnd,
            position,
          });
        }
      }
    });

    return spans;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      {/* 预订来源 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">预订来源</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {Object.entries(BOOKING_SOURCES).map(([key, source]) => (
              <div key={key} className="flex items-center space-x-1 sm:space-x-2">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${source.color}`}></div>
                <span className="text-xs sm:text-sm">{source.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 日历 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-1 sm:space-x-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-base sm:text-lg">
                {calendarData.currentYear}年 {calendarData.currentMonth + 1}月
              </span>
            </CardTitle>
            <div className="flex space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 sm:space-y-2">
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-4">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历周 */}
            {calendarData.weeks.map((weekDates, weekIndex) => {
              const weekSpans = getBookingSpans(weekDates);

              return (
                <div key={weekIndex} className="relative">
                  {/* 日期行 - 响应式正方形单元格 */}
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1 relative">
                    {weekDates.map((date, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`
                          border rounded p-1 sm:p-2 text-xs sm:text-sm relative aspect-square flex
                          ${isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                          ${formatDate(date) === formatDate(new Date()) ? 'ring-1 sm:ring-2 ring-blue-500' : ''}
                        `}
                      >
                        <span className="font-medium text-left text-xs sm:text-sm">{date.getDate()}</span>
                      </div>
                    ))}

                    {/* 预订跨度 - 覆盖在日期之上但不遮挡左上角日期 */}
                    {weekSpans.map((span, index) => (
                      <div
                        key={`${span.booking.id}-${index}`}
                        className={`
                          absolute h-5 sm:h-8 rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-medium
                          ${BOOKING_SOURCES[span.booking.source].color}
                          ${BOOKING_SOURCES[span.booking.source].textColor}
                          flex items-center justify-between
                          cursor-pointer hover:opacity-90 transition-opacity
                          shadow-sm z-10
                        `}
                        style={{
                          left: `${span.position.left}%`,
                          width: `${span.position.width}%`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                        onClick={() => setSelectedBooking(span.booking)}
                        title={`${span.booking.guestName} - ${span.booking.checkIn} 到 ${span.booking.checkOut} - ${BOOKING_SOURCES[span.booking.source].name}`}
                      >
                        <span className="truncate text-xs">
                          {span.isStart ? span.booking.guestName : ''}
                        </span>
                        {span.isEnd && span.booking.totalPrice && (
                          <span className="ml-1 sm:ml-2 font-bold text-xs">
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

      {/* 本月统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">本月统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">
                {bookings.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">预订数</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                ¥{bookings
                  .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
                  .toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">总收入</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">
                {bookings
                  .reduce((sum, b) => sum + (b.guestCount || 0), 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">总客人数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订单详情弹窗 */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold">订单详情</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <span className="text-xs sm:text-sm text-gray-600">客人姓名:</span>
                <span className="ml-2 font-medium text-sm sm:text-base">{selectedBooking.guestName}</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">入住日期:</span>
                <span className="ml-2 text-sm sm:text-base">{selectedBooking.checkIn}</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">退房日期:</span>
                <span className="ml-2 text-sm sm:text-base">{(() => {
                  const checkOutDate = new Date(selectedBooking.checkOut + 'T00:00:00');
                  checkOutDate.setDate(checkOutDate.getDate() + 1);
                  return formatDate(checkOutDate);
                })()}</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">预订来源:</span>
                <span className="ml-2 text-sm sm:text-base">{BOOKING_SOURCES[selectedBooking.source].name}</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-600">状态:</span>
                <span className="ml-2 text-sm sm:text-base">{selectedBooking.status}</span>
              </div>
              {selectedBooking.totalPrice && (
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">总价:</span>
                  <span className="ml-2 font-medium text-sm sm:text-base">¥{selectedBooking.totalPrice.toLocaleString()}</span>
                </div>
              )}
              {selectedBooking.guestCount && (
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">客人数:</span>
                  <span className="ml-2 text-sm sm:text-base">{selectedBooking.guestCount}人</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}