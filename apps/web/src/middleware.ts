import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // 包含根路径
    '/',
    // 包含所有国际化路径，但排除静态资源
    '/(ja|en)/:path*',
    // 排除 API 路由、静态文件等
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
