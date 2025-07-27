import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function SectionHero() {
  const t = useTranslations('SectionHero');

  return (
    <section
      /* ① isolate = 自成层叠上下文 */
      className="relative isolate h-screen-dock w-full snap-start overflow-hidden flex items-center justify-center px-4 text-center"
    >
      {/* ② 背景图：给 **wrapper** 本身就置负 z */}
      <Image
        src="/images/hero.jpg"
        alt="Hakuba panorama"
        fill
        priority
        sizes="100vw"
        style={{ zIndex: -30 }}                 /* ← 关键！直接写到 wrapper */
        className="object-cover object-center select-none pointer-events-none"
      />

      {/* ③ 半透明遮罩：正 z10 */}
      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />

      {/* ④ 文案：正 z20 */}
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