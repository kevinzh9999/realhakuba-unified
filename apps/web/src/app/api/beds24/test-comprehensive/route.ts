// apps/web/src/app/api/beds24/test-comprehensive/route.ts
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

async function testEndpoint(endpoint: string, payload: any, description: string) {
  try {
    console.log(`\n🧪 测试 ${description}...`);
    const response = await fetch(`https://api.beds24.com/json/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.log(`❌ ${description} 失败:`, response.status);
      return { 
        endpoint, 
        success: false, 
        status: response.status,
        error: responseText.substring(0, 200)
      };
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log(`❌ ${description} JSON解析失败`);
      return { 
        endpoint, 
        success: false, 
        error: 'JSON parse error',
        raw: responseText.substring(0, 200)
      };
    }

    // 分析数据中是否包含评论相关字段
    const reviewFields = findReviewFields(data);
    console.log(`✅ ${description} 成功, 找到 ${reviewFields.length} 个可能的评论字段`);
    
    return {
      endpoint,
      success: true,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
      reviewFields,
      sampleData: getSampleData(data)
    };

  } catch (error) {
    console.log(`💥 ${description} 异常:`, error);
    return { 
      endpoint, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function findReviewFields(data: any, path: string = ''): Array<{path: string, value: any, type: string}> {
  const reviewFields: Array<{path: string, value: any, type: string}> = [];
  
  if (data && typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      const currentPath = path ? `${path}.${key}` : key;
      const lowerKey = key.toLowerCase();
      
      // 检查是否是评论相关字段
      if (lowerKey.includes('review') || 
          lowerKey.includes('rating') || 
          lowerKey.includes('comment') ||
          lowerKey.includes('feedback') ||
          lowerKey.includes('score') ||
          lowerKey.includes('star') ||
          lowerKey.includes('guest') && (lowerKey.includes('comment') || lowerKey.includes('feedback'))) {
        reviewFields.push({
          path: currentPath,
          value: typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value,
          type: typeof value
        });
      }
      
      // 递归搜索嵌套对象（限制深度避免无限递归）
      if (typeof value === 'object' && value !== null && path.split('.').length < 3) {
        reviewFields.push(...findReviewFields(value, currentPath));
      }
    }
  }
  
  return reviewFields;
}

function getSampleData(data: any) {
  if (Array.isArray(data)) {
    return data.slice(0, 2).map(item => {
      if (typeof item === 'object' && item !== null) {
        const keys = Object.keys(item);
        return keys.slice(0, 10).reduce((acc, key) => {
          acc[key] = typeof item[key] === 'string' && item[key].length > 50 
            ? item[key].substring(0, 50) + '...' 
            : item[key];
          return acc;
        }, {} as any);
      }
      return item;
    });
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    return keys.slice(0, 10).reduce((acc, key) => {
      acc[key] = typeof data[key] === 'string' && data[key].length > 50 
        ? data[key].substring(0, 50) + '...' 
        : data[key];
      return acc;
    }, {} as any);
  }
  return data;
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

    console.log('🚀 开始全面测试Beds24 API寻找评论数据');
    console.log('🏠 属性:', { propertyName, roomId: propertyConfig.roomId });

    const basePayload = {
      authentication: {
        apiKey: API_KEY,
        propKey: propertyConfig.propKey,
      }
    };

    const results = [];

    // 1. 测试 getProperty - 可能包含评分统计
    results.push(await testEndpoint('getProperty', {
      ...basePayload,
      roomId: propertyConfig.roomId
    }, 'getProperty'));

    // 2. 测试 getPropertyContent - 可能包含评论内容
    results.push(await testEndpoint('getPropertyContent', {
      ...basePayload,
      roomId: propertyConfig.roomId
    }, 'getPropertyContent'));

    // 3. 测试 getBookings - 检查已完成预订的评论
    results.push(await testEndpoint('getBookings', {
      ...basePayload,
      bookingFrom: '2024-01-01',
      bookingTo: '2025-02-01',
      includeInvoice: true,
      includeGuest: true,
      includeInfoItems: true,
      modifiedSince: '2024-01-01'
    }, 'getBookings (详细信息)'));

    // 4. 测试 getMessages - OTA消息可能包含评论通知
    results.push(await testEndpoint('getMessages', {
      ...basePayload,
      messageFrom: '2024-01-01',
      messageTo: '2025-02-01'
    }, 'getMessages'));

    // 5. 测试 getAccount - 账户级别可能有评分统计
    results.push(await testEndpoint('getAccount', {
      authentication: {
        apiKey: API_KEY,
        propKey: propertyConfig.propKey,
      }
    }, 'getAccount'));

    console.log('\n📊 测试完成');

    // 汇总所有找到的评论相关字段
    const allReviewFields = results
      .filter(r => r.success && r.reviewFields)
      .flatMap(r => r.reviewFields?.map((field: any) => ({ 
        ...field, 
        endpoint: r.endpoint 
      })) || []);

    return NextResponse.json({
      success: true,
      summary: {
        totalEndpointsTested: results.length,
        successfulEndpoints: results.filter(r => r.success).length,
        totalReviewFieldsFound: allReviewFields.length,
        endpointsWithReviewData: results.filter(r => r.success && r.reviewFields && r.reviewFields.length > 0).map(r => r.endpoint)
      },
      reviewFields: allReviewFields,
      detailedResults: results
    });

  } catch (error) {
    console.error('💥 测试异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}