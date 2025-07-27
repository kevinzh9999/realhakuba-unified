'use client';

import { PropertyCard } from '@/components/features/property-card';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useTranslations, useLocale } from 'next-intl';
import propsConfig from '@/config/props.config.json';

export default function StaysPage() {
  const t = useTranslations('StaysPage');
  const locale = useLocale() as 'en' | 'ja';

  // 从 props.config.json 构建属性列表
  const properties = Object.entries(propsConfig).map(([id, property]) => ({
    id,
    name: property.title[locale],
    description: property.subtitle[locale],
    image: property.gallery[0], // 使用第一张图片
    price: property.price,
    guests: property.summary.guests,
    bedrooms: property.summary.bedrooms,
  }));

  return (
    <>
      <Header />
      <div className="min-h-screen pt-[var(--header-h)]">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}