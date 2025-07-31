// apps/web/src/app/api/admin/owners/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 读取物业配置
    const propsConfigStr = process.env.PROPS_SECRET_JSON;
    if (!propsConfigStr) {
      return NextResponse.json(
        { error: 'Properties configuration not found' },
        { status: 500 }
      );
    }

    let propsConfig;
    try {
      propsConfig = JSON.parse(propsConfigStr);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid properties configuration' },
        { status: 500 }
      );
    }

    // 转换为owner列表
    const owners = Object.keys(propsConfig).map(propertyName => ({
      propertyName,
      hasPassword: !!(propsConfig[propertyName].passwordHash && 
                      propsConfig[propertyName].passwordHash !== 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'), // 不是空字符串的hash
      lastUpdated: propsConfig[propertyName].lastUpdated || null
    }));

    return NextResponse.json({ owners });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}