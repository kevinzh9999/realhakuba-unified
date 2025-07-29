// apps/web/src/app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// 临时的管理员账户（生产环境应该使用数据库）
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@realhakuba.com',
  // 密码: AdminReal2024! (这是示例，请更改)
  passwordHash: process.env.ADMIN_PASSWORD_HASH || 
    crypto.createHash('sha256').update('AdminReal2024!').digest('hex')
};

// 生成简单的 token（生产环境应该使用 JWT）
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

    // 验证邮箱
    if (email !== ADMIN_CREDENTIALS.email) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 验证密码
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (passwordHash !== ADMIN_CREDENTIALS.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 生成 token
    const token = generateToken(email);

    // 创建响应
    const response = NextResponse.json({
      success: true,
      user: { email }
    });

    // 设置 cookie - 这是修复的关键部分
    response.cookies.set('admin-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 小时
      path: '/'
    });

    // 记录登录日志（可选）
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