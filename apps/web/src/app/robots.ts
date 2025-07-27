// apps/homepage/src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/'],
    },
    sitemap: [
      'https://realhakuba.com/sitemap.xml',
      'https://stays.realhakuba.com/sitemap.xml',
      'https://reservation.realhakuba.com/sitemap.xml',
    ],
  }
}