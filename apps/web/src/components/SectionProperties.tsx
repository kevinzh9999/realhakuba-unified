'use client';

import raw from '@/config/props.config.json';
import ClientCarousel from './SectionPropertiesCarousel';
import { useLocale } from 'next-intl';

/** 原始 JSON 的结构 */
type RawProperty = (typeof raw)[keyof typeof raw];

/** 轮播真正需要的扁平结构 */
export interface Property {
  id: string;
  name: string;
  subtitle: string;
  heroImage: string;
}

/** 拼 URL 工具（确保不会出现双斜线） */
function buildUrl(base: string, ...paths: string[]) {
  return [base.replace(/\/+$/, ''), ...paths.map(p => p.replace(/^\/+/, ''))].join('/');
}

const CDN = process.env.NEXT_PUBLIC_PROP_URL!;    

export default function SectionProperties() {
  const locale = useLocale();

  // 动态展开属性，并按 locale 显示内容
  const properties: Property[] = Object.entries(raw).map(([slug, p]: [string, RawProperty]) => {
    // 优先取 gallery[0]，没有再 fallback 到 hero
    const firstGallery = Array.isArray(p.gallery) && p.gallery.length > 0
      ? p.gallery[0]
      : p.hero ?? '';

    const filename = firstGallery.split('/').pop() ?? '';

    // 多语言兼容，若字段非对象直接用
    const getByLocale = (obj: any) => (typeof obj === 'object' && obj !== null ? obj[locale] ?? Object.values(obj)[0] : obj);

    return {
      id: slug,
      name: getByLocale(p.title),
      subtitle: getByLocale(p.subtitle),
      heroImage: buildUrl(CDN, slug, 'images', filename),
    };
  });

  return <ClientCarousel data={properties} locale={locale} />;
}