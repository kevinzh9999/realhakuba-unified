// apps/web/src/app/api/owner/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 验证业主权限
async function verifyOwnerAuth(request: NextRequest, propertyId: string) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('owner-auth');
  const propertyCookie = cookieStore.get('owner-property');
  
  if (!authCookie || !propertyCookie) {
    throw new Error('Unauthorized');
  }
  
  // 检查是否有权限访问该物业
  if (propertyCookie.value !== propertyId) {
    throw new Error('Access denied to this property');
  }
  
  return true;
}

// 模拟数据（作为后备）
function getTestBookings(propertyId: string, year: number, month: number) {
  return [
    {
      id: `TEST-001-${propertyId}`,
      guestName: '[测试] 田中太郎',
      checkIn: `${year}-${month.toString().padStart(2, '0')}-05`,
      checkOut: `${year}-${month.toString().padStart(2, '0')}-08`,
      source: 'airbnb' as const,
      status: 'confirmed' as const,
      totalPrice: 84000,
      guestCount: 2,
    },
    {
      id: `TEST-002-${propertyId}`,
      guestName: '[测试] John Smith',
      checkIn: `${year}-${month.toString().padStart(2, '0')}-12`,
      checkOut: `${year}-${month.toString().padStart(2, '0')}-15`,
      source: 'booking' as const,
      status: 'confirmed' as const,
      totalPrice: 96000,
      guestCount: 4,
    },
    {
      id: `TEST-003-${propertyId}`,
      guestName: '[测试] 李小明',
      checkIn: `${year}-${month.toString().padStart(2, '0')}-20`,
      checkOut: `${year}-${month.toString().padStart(2, '0')}-23`,
      source: 'agoda' as const,
      status: 'pending' as const,
      totalPrice: 84000,
      guestCount: 3,
    },
  ];
}

// 检测预订来源
function detectBookingSource(referer: string): 'airbnb' | 'booking' | 'agoda' | 'direct' | 'other' {
  if (!referer) return 'other';
  
  const refererLower = referer.toLowerCase();
  
  // 根据实际Beds24数据优化检测
  if (refererLower.includes('booking.com') || refererLower === 'booking.com') {
    return 'booking';
  }
  if (refererLower.includes('agoda.com') || refererLower === 'agoda.com') {
    return 'agoda';
  }
  if (refererLower.includes('ical import') || refererLower.includes('airbnb')) {
    return 'airbnb';
  }
  if (refererLower.includes('direct') || refererLower.includes('website') || refererLower.includes('manual')) {
    return 'direct';
  }
  
  return 'other';
}

// 从Beds24获取真实数据
async function fetchFromBeds24(propertyId: string, year: number, month: number) {
  try {
    // 检查配置
    if (!process.env.PROPS_SECRET_JSON || !process.env.BEDS24_API_KEY) {
      console.log(`Missing Beds24 configuration, using test data for ${propertyId}`);
      return getTestBookings(propertyId, year, month);
    }

    const propsSecret = JSON.parse(process.env.PROPS_SECRET_JSON);
    const config = propsSecret[propertyId.toLowerCase()];
    
    if (!config?.propKey || !config?.roomId) {
      console.log(`Missing propKey/roomId for ${propertyId}, using test data`);
      return getTestBookings(propertyId, year, month);
    }

    const { propKey, roomId } = config;
    
    // 计算日期范围
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    console.log(`Fetching Beds24 bookings for ${propertyId}: ${startDate} to ${endDate}`);

    // 调用Beds24 API
    const response = await fetch('https://api.beds24.com/json/getBookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authentication: {
          apiKey: process.env.BEDS24_API_KEY,
          propKey,
        },
        roomId,
        arrivalFrom: startDate,
        arrivalTo: endDate,
        departureFrom: startDate,
        departureTo: endDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`Beds24 API error: ${response.status}`);
    }

    const beds24Data = await response.json();
    console.log(`Beds24 returned ${beds24Data?.length || 0} bookings for ${propertyId}`);

    if (beds24Data?.error) {
      throw new Error(`Beds24 error: ${beds24Data.error}`);
    }

    if (!Array.isArray(beds24Data) || beds24Data.length === 0) {
      console.log(`No Beds24 bookings found for ${propertyId} in ${year}-${month}`);
      return [];
    }

    // 转换Beds24数据
    const bookings = beds24Data.map((booking: any, index: number) => {
      const id = booking.bookId || `b24-${index}`;
      const firstName = booking.guestFirstName || '';
      const lastName = booking.guestName || '';
      const guestName = `${firstName} ${lastName}`.trim() || `Guest ${index + 1}`;
      
      // Beds24使用 firstNight 和 lastNight 字段
      let checkIn = booking.firstNight;
      let checkOut = booking.lastNight;
      
      // 如果 lastNight 只是一天，需要添加一天作为 checkOut
      if (checkIn && checkOut && checkIn === checkOut) {
        const checkOutDate = new Date(checkOut);
        checkOutDate.setDate(checkOutDate.getDate() + 1);
        checkOut = checkOutDate.toISOString().split('T')[0];
      }
      
      const referer = booking.referer || booking.refererEditable || '';
      const source = detectBookingSource(referer);
      const status = booking.status === '2' ? 'confirmed' as const : 'pending' as const;
      const totalPrice = parseFloat(booking.price || 0);
      const guestCount = parseInt(booking.numAdult || 1);

      return {
        id,
        guestName,
        checkIn,
        checkOut,
        source,
        status,
        totalPrice,
        guestCount,
      };
    }).filter(booking => {
      // 过滤掉取消的预订（status "0"）和阻止的日期（status "4"）
      const originalBooking = beds24Data.find(b => b.bookId === booking.id);
      return originalBooking && originalBooking.status !== '0' && originalBooking.status !== '4';
    });

    console.log(`Successfully processed ${bookings.length} Beds24 bookings for ${propertyId}`);
    return bookings;

  } catch (error) {
    console.error(`Beds24 fetch failed for ${propertyId}:`, error);
    console.log(`Falling back to test data for ${propertyId}`);
    return getTestBookings(propertyId, year, month);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    console.log(`[OWNER API] Fetching bookings for ${propertyId}, ${year}-${month}`);

    // 验证权限
    await verifyOwnerAuth(request, propertyId);

    // 获取预订数据（真实或测试）
    const bookings = await fetchFromBeds24(propertyId, year, month);

    console.log(`[OWNER API] Returning ${bookings.length} bookings for ${propertyId}`);

    return NextResponse.json({
      success: true,
      bookings,
      propertyId,
      year,
      month,
    });

  } catch (error) {
    console.error('Error in owner bookings API:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized' || error.message === 'Access denied to this property') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}