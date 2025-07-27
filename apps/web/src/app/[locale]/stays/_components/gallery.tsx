// components/ui/Gallery.tsx
'use client';

import Image from 'next/image';
import clsx from 'clsx';

type GalleryProps = {
    images: string[];
};

/**
 * Gallery
 * - Desktop: 12-col CSS grid（#2 图放大）
 * - Mobile : snap-scroll carousel
 */
export default function Gallery({ images }: GalleryProps) {
    return (
        <section id="gallery" className="w-full">
            {/* ── Mobile Carousel ─────────────────── */}
            <div className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-1">
                {images.map((src, i) => (
                    <div
                        key={src}
                        className="relative shrink-0 w-4/5 aspect-[4/3] snap-center rounded-2xl overflow-hidden"
                    >
                        <Image
                            src={src}
                            alt={`gallery ${i + 1}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* ── Desktop Grid ────────────────────── */}
            <div className="hidden md:grid gap-6 grid-cols-12 auto-rows-[200px]">
                {images.map((src, i) => (
                    <div
                        key={src}
                        className={clsx(
                            'relative overflow-hidden rounded-2xl',
                            i === 1 ? 'col-span-6 row-span-2' : 'col-span-3'
                        )}
                    >
                        <Image
                            src={src}
                            alt={`gallery ${i + 1}`}
                            fill
                            priority={i === 0} /* 首图抢先加载，轻微优化 */
                            className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}