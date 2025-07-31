// apps/web/src/app/api/admin/auth/login/route.ts
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

function generateToken(email: string): string {
  const timestamp = Date.now();
  const data = `${email}:${timestamp}:${process.env.ADMIN_JWT_SECRET || 'secret-key'}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 从数据库查询用户
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log('[ADMIN LOGIN] User not found:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 验证密码
    const passwordHash = hashPassword(password);
    if (passwordHash !== user.password_hash) {
      console.log('[ADMIN LOGIN] Password mismatch for:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 生成token
    const token = generateToken(email);

    // 创建响应
    const response = NextResponse.json({
      success: true,
      user: { email: user.email, role: user.role }
    });

    // 设置cookie
    response.cookies.set('admin-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24小时
      path: '/'
    });

    console.log(`[ADMIN LOGIN] Success: ${email} at ${new Date().toISOString()}`);
    return response;

  } catch (error) {
    console.error('[ADMIN LOGIN] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}