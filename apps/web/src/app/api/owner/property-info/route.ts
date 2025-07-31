// apps/web/src/app/api/owner/property-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // 验证权限
    await verifyOwnerAuth(request, propertyId);

    // 读取物业配置
    const configPath = path.join(process.cwd(), 'src/config/props.config.json');
    const fileContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(fileContent);
    
    const propertyConfig = config[propertyId];
    
    if (!propertyConfig) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // 返回业主需要的基本信息（多语言，默认返回英文或第一个可用语言）
    const getLocalizedValue = (obj: any) => {
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'object' && obj !== null) {
        return obj.en || obj.ja || obj.zh || Object.values(obj)[0] || '';
      }
      return '';
    };

    const propertyInfo = {
      id: propertyId,
      title: getLocalizedValue(propertyConfig.title),
      subtitle: getLocalizedValue(propertyConfig.subtitle),
      hero: propertyConfig.hero,
      price: propertyConfig.price,
      summary: propertyConfig.summary,
    };

    return NextResponse.json(propertyInfo);

  } catch (error) {
    console.error('Error in property info API:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized' || error.message === 'Access denied to this property') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch property info' },
      { status: 500 }
    );
  }
}