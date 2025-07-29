// components/SectionHero.tsx
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getImageWithBlur } from '@/lib/utils/image-utils';

export default async function SectionHero() {
  const t = await getTranslations('SectionHero');
  
  // 尝试生成模糊占位符
  let blurDataURL: string | undefined;
  try {
    const imageData = await getImageWithBlur('/images/hero.jpg');
    blurDataURL = imageData.blurDataURL || undefined;
  } catch (error) {
    // 静默失败，继续使用原图
  }

  return (
    <section
      className="relative isolate h-screen-dock w-full snap-start overflow-hidden flex items-center justify-center px-4 text-center"
    >
      <Image
        src="/images/hero.jpg"
        alt="Hakuba panorama"
        fill
        priority
        sizes="100vw"
        quality={90}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        style={{ zIndex: -30 }}
        className="object-cover object-center select-none pointer-events-none"
      />

      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />

      <div className="relative z-20 text-white drop-shadow-md">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-wide">
          {t('title')}
        </h1>
        <p className="mt-6 max-w-md mx-auto leading-relaxed whitespace-pre-line">
          {t('subtitle')}
        </p>
      </div>
    </section>
  );
}