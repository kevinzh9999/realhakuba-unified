// app/[locale]/stays/page.tsx
import { PropertyCard } from '@/components/features/property-card';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getTranslations } from 'next-intl/server';
import propsConfig from '@/config/props.config.json';
import { getImageWithBlur } from '@/lib/utils/image-utils';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function StaysPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'StaysPage' });

  // 使用 Promise.all 并行处理所有图片
  const properties = await Promise.all(
    Object.entries(propsConfig).map(async ([id, property]) => {
      // 获取第一张图片的模糊占位符
      const imageData = await getImageWithBlur(property.gallery[0]);
      
      return {
        id,
        name: property.title[locale as keyof typeof property.title],
        description: property.subtitle[locale as keyof typeof property.subtitle],
        image: property.gallery[0],
        price: property.price,
        guests: property.summary.guests,
        bedrooms: property.summary.bedrooms,
        blurDataURL: imageData.blurDataURL,
        width: imageData.width,
        height: imageData.height,
      };
    })
  );

  // SEO 文本内容保持不变
  const seoContent = {
    zh: {
      intro: "探索白馬村最優質的民宿和旅館。我們精心挑選的住宿選擇包括河畔木屋、森林小屋和寬敞別墅，所有房源都位於主要滑雪場附近，提供舒適的居住環境。",
      keywords: "白馬住宿 · 白馬民宿 · 白馬旅館 · 白馬滑雪住宿"
    },
    en: {
      intro: "Discover the finest accommodations in Hakuba Village. Our carefully selected properties include riverside lodges, forest retreats, and spacious villas, all conveniently located near major ski resorts.",
      keywords: "Hakuba accommodation · Hakuba hotels · Hakuba vacation rental · Hakuba ski lodge"
    },
    ja: {
      intro: "白馬村の最高の宿泊施設をご紹介します。リバーサイドログハウス、森の隠れ家、広々とした別荘など、主要スキー場近くの厳選された宿泊施設をご用意しています。",
      keywords: "白馬 宿泊 · 白馬 民宿 · 白馬 旅館 · 白馬 スキー 宿"
    }
  };

  const content = seoContent[locale as keyof typeof seoContent] || seoContent.en;
  const titleParts = t('title').split('by Real Hakuba');
  const hasRealHakuba = titleParts.length > 1;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[var(--header-h)]">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 leading-tight text-center md:text-left">
            {hasRealHakuba ? (
              <>
                <span className="block md:inline">{titleParts[0].trim()}</span>
                <span className="block md:inline mt-1 md:mt-0">
                  {' '}by Real Hakuba
                </span>
              </>
            ) : (
              t('title')
            )}
          </h1>
          
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-10 md:mb-12 max-w-4xl leading-relaxed md:leading-loose text-center md:text-left mx-auto md:mx-0">
            {content.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          <p className="text-[10px] md:text-xs text-gray-300 mt-16 md:mt-20 text-center leading-relaxed">
            {content.keywords}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}