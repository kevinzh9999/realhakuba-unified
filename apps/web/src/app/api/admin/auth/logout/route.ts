// apps/web/src/app/api/admin/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  // 创建响应
  const response = NextResponse.json({ success: true });
  
  // 通过设置过期的 cookie 来删除它
  response.cookies.set('admin-auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // 立即过期
    path: '/'
  });
  
  return response;
}