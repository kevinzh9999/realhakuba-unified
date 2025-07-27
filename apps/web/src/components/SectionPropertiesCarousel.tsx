'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Property } from '@/components/SectionProperties';

const STAYS_URL = process.env.NEXT_PUBLIC_PROP_URL!;

export default function SectionPropertiesCarousel({ data, locale }: { data: Property[], locale: string }) {
  // 控制是在移动端还是桌面端
  const [isMobile, setIsMobile] = useState(true);
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
        navigation={!isMobile}           // 桌面端启用箭头
        pagination={
          isMobile
            ? { clickable: true, dynamicBullets: true }  // 移动端启用动态分页
            : false
        }
        className="h-full"
      >
        {data.map((p) => (
          <SwiperSlide key={p.id}>
            <div className="block w-full h-full relative">
              <img
                src={p.heroImage}
                alt={p.name}
                className="h-full w-full object-cover"
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