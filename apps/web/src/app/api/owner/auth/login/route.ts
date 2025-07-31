// apps/web/src/app/api/owner/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(propertyName: string): string {
  const timestamp = Date.now();
  const data = `${propertyName}:${timestamp}:${process.env.ADMIN_JWT_SECRET || 'secret-key'}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { propertyName, password } = await request.json();

    // 验证输入
    if (!propertyName || !password) {
      return NextResponse.json(
        { error: 'Property name and password are required' },
        { status: 400 }
      );
    }

    // 从数据库查询用户（与Admin API完全一致的模式）
    const { data: user, error } = await supabase
      .from('owner_users')
      .select('*')
      .eq('property_name', propertyName)
      .single();

    if (error || !user) {
      console.log('[OWNER LOGIN] User not found:', propertyName);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 验证密码（与Admin API完全一致的逻辑）
    const passwordHash = hashPassword(password);
    if (passwordHash !== user.password_hash) {
      console.log('[OWNER LOGIN] Password mismatch for:', propertyName);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 生成token
    const token = generateToken(propertyName);

    // 创建响应（与Admin API完全一致）
    const response = NextResponse.json({
      success: true,
      user: { propertyName: user.property_name }
    });

    // 设置cookie（与Admin API完全一致的参数）
    response.cookies.set('owner-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24小时
      path: '/'
    });
    
    // 🆕 添加这个 cookie 来存储 property name
    response.cookies.set('owner-property', user.property_name, {
      httpOnly: false,  // 让前端也能读取
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24小时
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