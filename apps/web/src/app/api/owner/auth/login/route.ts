// apps/web/src/app/api/owner/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { propertyName, password } = await request.json();

    if (!propertyName || !password) {
      return NextResponse.json(
        { error: 'Property name and password are required' },
        { status: 400 }
      );
    }

    // 读取物业配置
    const propsConfigStr = process.env.PROPS_SECRET_JSON;
    if (!propsConfigStr) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 500 }
      );
    }

    let propsConfig;
    try {
      propsConfig = JSON.parse(propsConfigStr);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid configuration' },
        { status: 500 }
      );
    }

    // 验证物业是否存在
    const propertyConfig = propsConfig[propertyName];
    if (!propertyConfig) {
      return NextResponse.json(
        { error: 'Invalid property name or password' },
        { status: 401 }
      );
    }

    // 验证密码
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (!propertyConfig.passwordHash || passwordHash !== propertyConfig.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid property name or password' },
        { status: 401 }
      );
    }

    // 生成简单的 token
    const timestamp = Date.now();
    const tokenData = `${propertyName}:${timestamp}:${process.env.OWNER_JWT_SECRET || 'owner-secret'}`;
    const token = crypto.createHash('sha256').update(tokenData).digest('hex');

    // 创建响应
    const response = NextResponse.json({
      success: true,
      propertyName
    });

    // 设置 cookie
    response.cookies.set('owner-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/'
    });

    response.cookies.set('owner-property', propertyName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/'
    });

    console.log(`[OWNER LOGIN] Success: ${propertyName} at ${new Date().toISOString()}`);

    return response;
  } catch (error) {
    console.error('[OWNER LOGIN] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}