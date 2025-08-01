'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Property } from '@/components/SectionProperties';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function SectionPropertiesCarousel({ data, locale }: { data: Property[], locale: string }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    setIsMobile(!mq.matches);
    mq.addEventListener('change', onChange);
    
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <section className="relative h-screen-dock w-full snap-start bg-neutral-100">
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1}
        loop={false}
        navigation={!isMobile}
        pagination={
          isMobile
            ? { clickable: true, dynamicBullets: true, dynamicMainBullets: 2 }
            : false
        }
        className="h-full"
        // 移除 lazy 配置，只依赖 Next.js Image 的 lazy loading
      >
        {data.map((p, index) => (
          <SwiperSlide key={p.id}>
            <div className="block w-full h-full relative">
              <Image
                src={p.heroImage}
                alt={p.name}
                fill
                sizes="100vw"
                quality={75}
                // Next.js Image 自带的懒加载
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                className="object-cover"
              />
              
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h3 className="text-2xl font-medium">
                  <Link
                    href={`/stays/${p.id}`}
                    className="inline-block border-t border-b border-white py-1"
                  >
                    {p.name}
                  </Link>
                </h3>
                <p className="mt-1 text-base pb-1">{p.subtitle}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}