'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import useEmblaCarousel from 'embla-carousel-react';
import { format, formatInTimeZone } from 'date-fns-tz';
import { ja, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import WeatherIcon from '@/components/features/weather-widget';
import Image from 'next/image';
import clsx from 'clsx';

/* -------------------- 通用工具 -------------------- */
const fetcher = (url: string) => fetch(url).then(r => r.json());
const HAKUBA = { lat: 36.6982, lon: 137.8619 };
const JAPAN_TIMEZONE = 'Asia/Tokyo';

/* 活动 id 与图片（文案走翻译表） */
const ACTIVITIES = [
    { id: 'bike', img: '/images/activities/biking.jpg' },
    { id: 'bbq', img: '/images/activities/bbq.jpg' },
    { id: 'sup', img: '/images/activities/sup.jpg' },
    { id: 'plunge', img: '/images/activities/plunge.jpg' }
] as const;

/* -------------------- 组件 -------------------- */
export default function SectionFun() {
    const t = useTranslations('SectionFun');
    const locale = useLocale();
    const dfLocale = locale === 'ja' ? ja : enUS;
    const [activeId, setActiveId] = useState<string | null>(null);

    /* 1. 请求 14 天天气 */
    const url =
        `/api/open-meteo/forecast?lat=${HAKUBA.lat}&lon=${HAKUBA.lon}` +
        `&days=14&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=${JAPAN_TIMEZONE}`;
    const { data, error, isLoading } = useSWR(url, fetcher);

    /* 2. 拆成两页（每页 7 天） */
    const pages = useMemo(() => {
        if (!data?.daily?.time) return [];
        const d = data.daily;
        const day = (i: number) => ({
            date: d.time[i],
            code: d.weathercode[i],
            tMax: d.temperature_2m_max[i],
            tMin: d.temperature_2m_min[i]
        });
        return [
            Array.from({ length: 7 }, (_, i) => day(i)),
            Array.from({ length: 7 }, (_, i) => day(i + 7))
        ];
    }, [data]);

    /* 3. Embla 轮播 */
    const [emblaRef] = useEmblaCarousel({
        loop: false,
        align: 'center',
        containScroll: 'trimSnaps',
        slidesToScroll: 1
    });

    /* --------- 占位 / 错误 --------- */
    if (error) {
        return (
            <section className="h-screen-dock w-full snap-start flex items-center justify-center bg-red-50">
                <p className="text-red-600">{t('error')}</p>
            </section>
        );
    }
    if (isLoading || pages.length === 0) {
        return (
            <section className="h-screen-dock w-full snap-start flex items-center justify-center bg-gray-100">
                <p>{t('loading')}</p>
            </section>
        );
    }

    /* --------- 正式渲染 --------- */
    return (
        <section
            className="
        h-screen-dock 
        w-full snap-start flex flex-col bg-white
        pt-[calc(var(--header-h)+5px)]
      "
        >
            {/* ======= Weather Heading ======= */}
            <h3 className="pt-2 px-4 md:px-8 text-base font-semibold">
                {t('weatherTitle')}
            </h3>

            {/* ======= 天气轮播 ======= */}
            <div className="flex-none overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {pages.map((week, idx) => (
                        <div
                            key={idx}
                            className="flex-none w-full grid grid-cols-7 auto-rows-fr gap-2 p-2 md:p-4 place-items-center"
                        >
                            {week.map(d => {
                                // ✅ 使用 date-fns-tz 正确处理日本时区
                                const dateStr = d.date; // API 返回的格式如 "2025-07-27"
                                
                                return (
                                    <div
                                        key={d.date}
                                        className={clsx(
                                            'flex flex-col items-center justify-center',
                                            'w-full max-w-[90px] aspect-[3/5] py-2',
                                            'text-sky-900'
                                        )}
                                    >
                                        <span className="text-sm">
                                            {formatInTimeZone(dateStr, JAPAN_TIMEZONE, 'MM/dd')}
                                        </span>

                                        <span className="text-sm mt-[4px] mb-[3px]">
                                            {formatInTimeZone(dateStr, JAPAN_TIMEZONE, 'EEE', { locale: dfLocale })}
                                        </span>

                                        <WeatherIcon code={d.code} />
                                        <span className="text-sm mt-1 whitespace-nowrap">
                                            {Math.round(d.tMin)}–{Math.round(d.tMax)}°
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* ② 灰色分割线 */}
            <div className="mx-4 md:mx-8 border-t border-gray-200" />

            {/* ======= Activities Heading ======= */}
            <h3 className="px-4 md:px-8 text-base font-semibold mt-4">
                {t('activitiesTitle')}
            </h3>

            {/* ======= 活动网格 ======= */}
            <div
                className="
          flex-1 min-h-0
          grid grid-cols-2 md:grid-cols-4
          auto-rows-fr
          gap-x-[clamp(0.75rem,4vw,1.25rem)]
          gap-y-[clamp(0.5rem,2vh,1rem)]
          p-4 md:p-8
        "
            >
                {ACTIVITIES.map(({ id, img }, index) => (
                    <FlipCard
                        key={id}
                        title={t(`activities.${id}.title`)}
                        desc={t(`activities.${id}.desc`)}
                        img={img}
                        flipped={activeId === id}
                        onFlip={() => setActiveId(activeId === id ? null : id)}
                        priority={index < 2} // 前两个活动优先加载
                    />
                ))}
            </div>
        </section>
    );
}

/* ---------------- 翻转卡 ---------------- */
function FlipCard({
    title,
    img,
    desc,
    flipped,
    onFlip,
    priority = false
}: {
    title: string;
    img: string;
    desc: string;
    flipped: boolean;
    onFlip: () => void;
    priority?: boolean;
}) {
    return (
        <div
            className="relative h-full w-full aspect-[3/4] perspective cursor-pointer"
            onClick={onFlip}
        >
            <div
                className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
                    flipped ? 'rotate-y-180' : ''
                }`}
            >
                {/* front */}
                <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden bg-gray-100">
                    <Image 
                        src={img} 
                        alt={title} 
                        fill 
                        sizes="(max-width: 768px) 50vw, 25vw"
                        quality={75}
                        loading={priority ? "eager" : "lazy"}
                        priority={priority}
                        className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h3 className="text-white text-xl font-semibold px-2 text-center">{title}</h3>
                    </div>
                </div>

                {/* back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg bg-white p-4 flex items-center justify-center border border-gray-200">
                    <p className="text-sm text-center text-gray-700 leading-relaxed">
                        {desc}
                    </p>
                </div>
            </div>
        </div>
    );
}