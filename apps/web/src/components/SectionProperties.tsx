'use client';

import propsConfig from '@/config/props.config.json';
import ClientCarousel from './SectionPropertiesCarousel';
import { useLocale } from 'next-intl';

type RawProperty = (typeof propsConfig)[keyof typeof propsConfig];

export interface Property {
  id: string;
  name: string;
  subtitle: string;
  heroImage: string;
}

export default function SectionProperties() {
  const locale = useLocale();

  const properties: Property[] = Object.entries(propsConfig).map(([slug, p]: [string, RawProperty]) => {
    // 多语言处理函数
    const getByLocale = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        return obj[locale] ?? obj.en ?? Object.values(obj)[0];
      }
      return obj;
    };
    
    const heroImage = (Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery[0] : '') || p.hero;

    const result = {
      id: slug,
      name: getByLocale(p.title),
      subtitle: getByLocale(p.subtitle),
      heroImage,
    };


    return result;
  });

  console.log('=== Processed Properties ===');
  console.log('Properties count:', properties.length);
  console.log('Property IDs:', properties.map(p => p.id));
  properties.forEach((p, index) => {
    console.log(`${index}: ${p.id} - ${p.name} - ${p.heroImage}`);
  });

  return <ClientCarousel data={properties} locale={locale} />;
}