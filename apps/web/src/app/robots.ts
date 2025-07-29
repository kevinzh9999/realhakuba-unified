// apps/web/src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/reservation/confirmation', // 防止索引确认页面
          '/*.json$',  // 防止索引 JSON 文件
        ],
      },
      // 针对特定爬虫的规则（可选）
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
        ],
        crawlDelay: 0, // Google 不需要延迟
      },
      // 百度爬虫（如果需要中文 SEO）
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
        ],
        crawlDelay: 1, // 百度建议添加延迟
      },
    ],
    sitemap: 'https://realhakuba.com/sitemap.xml',
    host: 'https://realhakuba.com',
  }
}