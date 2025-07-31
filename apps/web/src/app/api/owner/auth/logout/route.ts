// apps/web/src/app/api/owner/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[OWNER LOGOUT] Processing logout request');
    
    const response = NextResponse.json({ 
      success: true, 
      message: '已成功登出' 
    });
    
    // 清除 cookies
    response.cookies.set('owner-auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即过期
      path: '/'
    });
    
    response.cookies.set('owner-property', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // 立即过期
      path: '/'
    });
    
    console.log(`[OWNER LOGOUT] Success at ${new Date().toISOString()}`);
    
    return response;
  } catch (error) {
    console.error('[OWNER LOGOUT] Error:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}