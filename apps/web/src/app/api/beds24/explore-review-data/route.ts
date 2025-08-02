// apps/web/src/app/api/beds24/explore-review-data/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.BEDS24_API_KEY;
const PROPS_SECRET_JSON = process.env.PROPS_SECRET_JSON;

interface PropertyConfig {
  propKey: string;
  roomId: string;
}

function getPropertyConfig(propertyName: string): PropertyConfig | null {
  try {
    if (!PROPS_SECRET_JSON) return null;
    const propsConfig = JSON.parse(PROPS_SECRET_JSON);
    return propsConfig[propertyName] || null;
  } catch (error) {
    return null;
  }
}

function extractReviewData(data: any, path: string = ''): any[] {
  const reviews: any[] = [];
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      reviews.push(...extractReviewData(item, `${path}[${index}]`));
    });
  } else if (data && typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      const currentPath = path ? `${path}.${key}` : key;
      const lowerKey = key.toLowerCase();
      
      // 查找评论相关字段
      if (lowerKey.includes('review') || 
          lowerKey.includes('rating') || 
          lowerKey.includes('comment') ||
          lowerKey.includes('feedback') ||
          lowerKey.includes('score')) {
        
        reviews.push({
          path: currentPath,
          key: key,
          value: value,
          type: typeof value,
          parent: path || 'root'
        });
      }
      
      // 递归搜索（限制深度）
      if (typeof value === 'object' && value !== null && path.split('.').length < 5) {
        reviews.push(...extractReviewData(value, currentPath));
      }
    }
  }
  
  return reviews;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyName = searchParams.get('propertyName') || 'riverside-loghouse';
    
    const propertyConfig = getPropertyConfig(propertyName);
    if (!propertyConfig) {
      return NextResponse.json({
        success: false,
        error: `Property config not found for: ${propertyName}`
      }, { status: 404 });
    }

    console.log('🔍 深度探索评论数据结构...');

    const basePayload = {
      authentication: {
        apiKey: API_KEY,
        propKey: propertyConfig.propKey,
      }
    };

    // 1. 获取 PropertyContent 数据
    console.log('📄 获取 PropertyContent...');
    const propertyContentResponse = await fetch('https://api.beds24.com/json/getPropertyContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...basePayload,
        roomId: propertyConfig.roomId
      })
    });

    let propertyContentData = null;
    let propertyContentReviews = [];
    
    if (propertyContentResponse.ok) {
      const propertyContentText = await propertyContentResponse.text();
      try {
        propertyContentData = JSON.parse(propertyContentText);
        propertyContentReviews = extractReviewData(propertyContentData);
        console.log(`✅ PropertyContent: 找到 ${propertyContentReviews.length} 个评论字段`);
      } catch (e) {
        console.log('❌ PropertyContent JSON解析失败');
      }
    }

    // 2. 获取 Bookings 数据
    console.log('📋 获取 Bookings...');
    const bookingsResponse = await fetch('https://api.beds24.com/json/getBookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...basePayload,
        bookingFrom: '2024-01-01',
        bookingTo: '2025-02-01',
        includeInvoice: true,
        includeGuest: true,
        includeInfoItems: true
      })
    });

    let bookingsData = null;
    let bookingsReviews = [];
    
    if (bookingsResponse.ok) {
      const bookingsText = await bookingsResponse.text();
      try {
        bookingsData = JSON.parse(bookingsText);
        bookingsReviews = extractReviewData(bookingsData);
        console.log(`✅ Bookings: 找到 ${bookingsReviews.length} 个评论字段`);
      } catch (e) {
        console.log('❌ Bookings JSON解析失败');
      }
    }

    // 分析数据
    const analysisResult = {
      propertyContent: {
        hasData: !!propertyContentData,
        reviewFields: propertyContentReviews.length,
        fields: propertyContentReviews.map(r => ({
          path: r.path,
          key: r.key,
          type: r.type,
          valuePreview: typeof r.value === 'string' ? r.value.substring(0, 100) : r.value
        }))
      },
      bookings: {
        hasData: !!bookingsData,
        totalBookings: Array.isArray(bookingsData) ? bookingsData.length : 0,
        reviewFields: bookingsReviews.length,
        // 按来源分组评论字段
        fieldsBySource: {},
        // 显示前10个最有趣的字段
        topFields: bookingsReviews
          .filter(r => r.value && (typeof r.value === 'string' ? r.value.length > 10 : true))
          .slice(0, 10)
          .map(r => ({
            path: r.path,
            key: r.key,
            type: r.type,
            valuePreview: typeof r.value === 'string' ? r.value.substring(0, 200) : r.value
          }))
      }
    };

    // 如果有预订数据，分析每个预订的来源
    if (Array.isArray(bookingsData)) {
      const sourceAnalysis: any = {};
      
      bookingsData.forEach((booking, index) => {
        const source = booking.source || 'unknown';
        if (!sourceAnalysis[source]) {
          sourceAnalysis[source] = {
            count: 0,
            sampleBooking: null,
            reviewFields: []
          };
        }
        
        sourceAnalysis[source].count++;
        
        if (!sourceAnalysis[source].sampleBooking) {
          sourceAnalysis[source].sampleBooking = {
            bookId: booking.bookId,
            guestName: booking.guestName,
            status: booking.status,
            firstNight: booking.firstNight,
            lastNight: booking.lastNight
          };
        }
        
        // 提取这个预订的评论字段
        const bookingReviews = extractReviewData(booking, `booking[${index}]`);
        sourceAnalysis[source].reviewFields.push(...bookingReviews);
      });

      analysisResult.bookings.fieldsBySource = sourceAnalysis;
    }

    return NextResponse.json({
      success: true,
      summary: {
        propertyContentReviewFields: propertyContentReviews.length,
        bookingsReviewFields: bookingsReviews.length,
        totalBookings: Array.isArray(bookingsData) ? bookingsData.length : 0
      },
      analysis: analysisResult,
      // 原始数据样本（截断以避免太大）
      rawDataSamples: {
        propertyContent: propertyContentData ? JSON.stringify(propertyContentData, null, 2).substring(0, 1000) : null,
        firstBooking: Array.isArray(bookingsData) && bookingsData[0] ? 
          JSON.stringify(bookingsData[0], null, 2).substring(0, 1500) : null
      }
    });

  } catch (error) {
    console.error('💥 探索数据异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}