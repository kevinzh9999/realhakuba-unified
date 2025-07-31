// apps/web/src/app/api/owner/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// 业主账户配置 - 可以从环境变量或数据库读取
const OWNER_CREDENTIALS: Record<string, string> = {
  // 物业ID: 密码哈希
  'riverside-loghouse': process.env.RIVERSIDE_LOGHOUSE_PASSWORD_HASH || 
    crypto.createHash('sha256').update('riverside123').digest('hex'),
  'moyai-house': process.env.MOYAI_HOUSE_PASSWORD_HASH || 
    crypto.createHash('sha256').update('moyai123').digest('hex'),
  'echo-villa': process.env.ECHO_VILLA_PASSWORD_HASH || 
    crypto.createHash('sha256').update('echo123').digest('hex'),
};

// 生成简单的 token
function generateToken(username: string): string {
  const timestamp = Date.now();
  const data = `${username}:${timestamp}:${process.env.OWNER_JWT_SECRET || 'owner-secret-key'}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证用户名（物业ID）
    const normalizedUsername = username.toLowerCase().trim();
    if (!OWNER_CREDENTIALS[normalizedUsername]) {
      return NextResponse.json(
        { error: '无效的物业ID或密码' },
        { status: 401 }
      );
    }

    // 验证密码
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (passwordHash !== OWNER_CREDENTIALS[normalizedUsername]) {
      return NextResponse.json(
        { error: '无效的物业ID或密码' },
        { status: 401 }
      );
    }

    // 生成 token
    const token = generateToken(normalizedUsername);

    // 创建响应
    const response = NextResponse.json({
      success: true,
      user: { 
        username: normalizedUsername,
        propertyId: normalizedUsername 
      }
    });

    // 设置 cookie
    const cookieStore = await cookies();
    response.cookies.set('owner-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/'
    });

    // 设置用户信息 cookie（用于前端识别用户）
    response.cookies.set('owner-property', normalizedUsername, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/'
    });

    // 记录登录日志
    console.log(`[OWNER LOGIN] Success: ${normalizedUsername} at ${new Date().toISOString()}`);

    return response;

  } catch (error) {
    console.error('[OWNER LOGIN] Error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 登出接口
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // 清除 cookies
    response.cookies.delete('owner-auth');
    response.cookies.delete('owner-property');
    
    return response;
  } catch (error) {
    console.error('[OWNER LOGOUT] Error:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}