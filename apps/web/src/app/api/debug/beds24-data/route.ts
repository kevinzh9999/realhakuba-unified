// apps/web/src/app/api/debug/beds24-data/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || 'riverside-loghouse';
    const year = parseInt(searchParams.get('year') || '2025');
    const month = parseInt(searchParams.get('month') || '8');

    // 检查配置
    if (!process.env.PROPS_SECRET_JSON || !process.env.BEDS24_API_KEY) {
      return NextResponse.json({
        error: 'Missing configuration',
        hasPropsSecret: !!process.env.PROPS_SECRET_JSON,
        hasApiKey: !!process.env.BEDS24_API_KEY,
      });
    }

    const propsSecret = JSON.parse(process.env.PROPS_SECRET_JSON);
    const config = propsSecret[propertyId.toLowerCase()];
    
    if (!config?.propKey || !config?.roomId) {
      return NextResponse.json({
        error: 'Missing property configuration',
        propertyId,
        availableProperties: Object.keys(propsSecret),
        config,
      });
    }

    const { propKey, roomId } = config;
    
    // 计算日期范围
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    console.log(`[DEBUG] Fetching Beds24 data for ${propertyId}`);
    console.log(`[DEBUG] Using propKey: ${propKey}, roomId: ${roomId}`);
    console.log(`[DEBUG] Date range: ${startDate} to ${endDate}`);

    // 调用Beds24 API
    const requestPayload = {
      authentication: {
        apiKey: process.env.BEDS24_API_KEY,
        propKey,
      },
      roomId,
      arrivalFrom: startDate,
      arrivalTo: endDate,
      departureFrom: startDate,
      departureTo: endDate,
    };

    console.log(`[DEBUG] Request payload:`, JSON.stringify(requestPayload, null, 2));

    const response = await fetch('https://api.beds24.com/json/getBookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    const responseText = await response.text();
    console.log(`[DEBUG] Raw response:`, responseText);

    let beds24Data;
    try {
      beds24Data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json({
        error: 'Failed to parse response',
        status: response.status,
        rawResponse: responseText,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
      });
    }

    // 分析数据结构
    const analysis = {
      responseStatus: response.status,
      responseOk: response.ok,
      dataType: Array.isArray(beds24Data) ? 'array' : typeof beds24Data,
      dataLength: Array.isArray(beds24Data) ? beds24Data.length : 'N/A',
      hasError: !!beds24Data.error,
      error: beds24Data.error,
    };

    // 如果有数据，分析第一个预订的结构
    let firstBookingAnalysis = null;
    if (Array.isArray(beds24Data) && beds24Data.length > 0) {
      const firstBooking = beds24Data[0];
      firstBookingAnalysis = {
        allKeys: Object.keys(firstBooking),
        dateKeys: Object.keys(firstBooking).filter(key => 
          key.toLowerCase().includes('date') || 
          key.toLowerCase().includes('arrival') || 
          key.toLowerCase().includes('departure') ||
          key.toLowerCase().includes('checkin') ||
          key.toLowerCase().includes('checkout')
        ),
        guestKeys: Object.keys(firstBooking).filter(key =>
          key.toLowerCase().includes('guest') ||
          key.toLowerCase().includes('name') ||
          key.toLowerCase().includes('first') ||
          key.toLowerCase().includes('last')
        ),
        priceKeys: Object.keys(firstBooking).filter(key =>
          key.toLowerCase().includes('price') ||
          key.toLowerCase().includes('total') ||
          key.toLowerCase().includes('amount')
        ),
        sourceKeys: Object.keys(firstBooking).filter(key =>
          key.toLowerCase().includes('source') ||
          key.toLowerCase().includes('referer') ||
          key.toLowerCase().includes('channel')
        ),
        sampleValues: {
          // 显示所有字段的示例值
          ...Object.fromEntries(
            Object.entries(firstBooking).map(([key, value]) => [
              key, 
              typeof value === 'string' && value.length > 50 
                ? value.substring(0, 50) + '...' 
                : value
            ])
          )
        }
      };
    }

    return NextResponse.json({
      success: true,
      requestInfo: {
        propertyId,
        year,
        month,
        propKey,
        roomId,
        dateRange: `${startDate} to ${endDate}`,
      },
      analysis,
      firstBookingAnalysis,
      rawData: beds24Data,
    });

  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({
      error: 'Debug API error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}