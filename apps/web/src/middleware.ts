// apps/web/src/middleware.ts (更新版本)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// 创建 next-intl 的中间件
const intlMiddleware = createMiddleware(routing);

// 定义不需要认证的路径
const publicPaths = ['/login', '/api/admin/auth/login', '/api/owner/auth/login'];

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // 判断域名类型
  const isAdminDomain = hostname.includes('admin.') || hostname.startsWith('admin-');
  const isOwnerDomain = hostname.includes('owner.') || hostname.startsWith('owner-');
  
  // 1. 处理管理后台域名的请求
  if (isAdminDomain) {
    // 1.1 处理根路径访问
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/en/bookings', request.url));
    }
    
    // 1.2 检查是否已经有 locale - 更新以支持 zh
    const hasLocale = pathname.startsWith('/en') || pathname.startsWith('/ja') || pathname.startsWith('/zh');
    
    if (hasLocale) {
      // 提取 locale 和路径 - 更新以支持 zh
      const locale = pathname.substring(1, 3); // 'en', 'ja' 或 'zh'
      const pathWithoutLocale = pathname.substring(3); // 去掉 locale 前缀
      
      // 1.3 重写路径：将 /locale/xxx 映射到 /locale/admin/xxx
      if (!pathWithoutLocale.startsWith('/admin')) {
        const adminPath = `/${locale}/admin${pathWithoutLocale}`;
        
        // 1.4 检查是否需要认证
        const needsAuth = !publicPaths.some(path => 
          pathWithoutLocale === path || pathWithoutLocale.startsWith(path)
        );
        
        if (needsAuth) {
          const authCookie = request.cookies.get('admin-auth');
          if (!authCookie) {
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
          }
        }
        
        // 重写请求到 admin 路径
        const rewriteUrl = new URL(adminPath, request.url);
        return NextResponse.rewrite(rewriteUrl);
      }
    } else {
      // 没有 locale 的情况，先应用 intl 中间件
      const response = intlMiddleware(request);
      
      // 如果 intl 中间件返回了重定向，修改重定向目标
      if (response.status === 307 || response.status === 308) {
        const location = response.headers.get('location');
        if (location && !location.includes('/admin')) {
          // 将重定向目标改为 admin 路径
          const url = new URL(location, request.url);
          const locale = url.pathname.substring(1, 3);
          const pathWithoutLocale = url.pathname.substring(3);
          const adminPath = `/${locale}/admin${pathWithoutLocale}`;
          
          return NextResponse.redirect(new URL(adminPath, request.url));
        }
      }
      
      return response;
    }
  }
  
  // 2. 处理业主后台域名的请求
  else if (isOwnerDomain) {
    // 2.1 处理根路径访问
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/en/dashboard', request.url));
    }
    
    // 2.2 检查是否已经有 locale
    const hasLocale = pathname.startsWith('/en') || pathname.startsWith('/ja') || pathname.startsWith('/zh');
    
    if (hasLocale) {
      // 提取 locale 和路径
      const locale = pathname.substring(1, 3); // 'en', 'ja' 或 'zh'
      const pathWithoutLocale = pathname.substring(3); // 去掉 locale 前缀
      
      // 2.3 重写路径：将 /locale/xxx 映射到 /locale/owner/xxx
      if (!pathWithoutLocale.startsWith('/owner')) {
        const ownerPath = `/${locale}/owner${pathWithoutLocale}`;
        
        // 2.4 检查是否需要认证（登录页面不需要认证）
        const needsAuth = !publicPaths.some(path => 
          pathWithoutLocale === path || pathWithoutLocale.startsWith(path)
        ) && pathWithoutLocale !== '/login';
        
        if (needsAuth) {
          const authCookie = request.cookies.get('owner-auth');
          if (!authCookie) {
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
          }
        }
        
        // 重写请求到 owner 路径
        const rewriteUrl = new URL(ownerPath, request.url);
        return NextResponse.rewrite(rewriteUrl);
      }
    } else {
      // 没有 locale 的情况，添加默认locale并重定向
      if (pathname === '/login') {
        return NextResponse.redirect(new URL('/en/login', request.url));
      }
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/en/dashboard', request.url));
      }
      
      // 对于其他路径，添加默认locale
      return NextResponse.redirect(new URL('/en' + pathname, request.url));
    }
  }
  
  // 3. 处理主站域名的请求
  else {
    // 3.1 阻止从主站访问 /admin 或 /owner 路径
    if (pathname.includes('/admin')) {
      const pathWithoutAdmin = pathname.replace(/\/admin/g, '');
      const adminUrl = `https://admin.realhakuba.com${pathWithoutAdmin}`;
      return NextResponse.redirect(adminUrl);
    }
    
    if (pathname.includes('/owner')) {
      const pathWithoutOwner = pathname.replace(/\/owner/g, '');
      const ownerUrl = `https://owner.realhakuba.com${pathWithoutOwner}`;
      return NextResponse.redirect(ownerUrl);
    }
  }
  
  // 4. 对于所有其他请求，应用 next-intl 中间件
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // 包含根路径
    '/',
    // 包含所有国际化路径，但排除静态资源 - 更新以支持 zh
    '/(ja|en|zh)/:path*',
    // 排除 API 路由、静态文件等
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};