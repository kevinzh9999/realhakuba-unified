"use client"

const WARM_SAND = '#FFFFFF';
const HEADER_HEIGHT = 85;
const HEADER_COMP = 15;
const FOOTER_HEIGHT = 100;

import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

import Lenis from '@studio-freight/lenis';

import {
    Key, House, MapPin,
    ChevronLeft, ChevronRight, ArrowLeft,
} from 'lucide-react';

import { FaWhatsapp } from "react-icons/fa";

import { BookingCard, MobileFooter, MobileCalendar } from '../_components';

import {
    Drawer,
    DrawerContent,
    DrawerTitle,
} from "@/components/ui/drawer";

import Gallery from "../_components/gallery";
import BedroomCard from "../_components/bedroom-card";
import { ThingsToKnow } from "../_components/things-to-know";
import Amenities from "../_components/amenities";

export interface ClientPageProps {
    propname: string;     // dynamic segment of the URL e.g. "riversideloghouse"
    config: PropConfig;   // full JSON blob for that property (title, gallery…)
    locale: string;
}

export interface PropertySummary {
    sqm: number;        // 建筑面积
    guests: number;     // 可住人数
    bedrooms: number;   // 卧室数
    bathrooms: number;  // 卫生间数
    petsAllowed: boolean;
}

export interface Highlight {
    heading: string;
    content: string;
}

export interface PropConfig {
    title: string;
    subtitle?: string;
    price: number;
    hero: string;
    gallery: string[];
    details: string;
    highlights?: Highlight[];
    summary: PropertySummary;
    bedrooms: Bedroom[];
    amenities?: Record<string, boolean>;
    location?: {
        mapEmbed: string;
        area: string;
        description: string;
    };
}


// --- 房间床型配置 ---
export interface BedConfig {
    double: number;   // 双人床数量
    single: number;   // 单人床数量
    tatami: number;   // 榻榻米蒲团数量
}

// --- 单个卧室 ---
export interface Bedroom {
    image?: string;    // 若无图片可省略，前端将用占位图标
    beds: BedConfig;
}


export default function ClientPage({ propname, config, locale }: ClientPageProps) {
    const mainRef = useRef<HTMLDivElement>(null);
    const [stickyNav, setStickyNav] = useState(false);
    const [compress, setCompress] = useState(0);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [whatsappInHeader, setWhatsappInHeader] = useState(false); // 新增：WhatsApp 图标状态

    const t = useTranslations('StaysApp.ClientPage');

    useEffect(() => {
        const handleScroll = () => {
            if (mainRef.current) {
                const rect = mainRef.current.getBoundingClientRect();
                const isMainTouchingHeader = rect.top <= HEADER_HEIGHT - HEADER_COMP;

                setStickyNav(isMainTouchingHeader);
                setWhatsappInHeader(isMainTouchingHeader); // WhatsApp 图标跟随 sticky nav 状态
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const lenis = new Lenis({ duration: 1.1 });
        const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);

        const onScroll = () => {
            const y = window.scrollY;
            const eased = 1 - Math.pow(1 - Math.min(HEADER_COMP, Math.max(0, y - 100)) / HEADER_COMP, 3);
            setCompress(eased * HEADER_COMP);
        };
        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => { window.removeEventListener('scroll', onScroll); lenis.destroy(); };
    }, []);


    // --- 1. 先放在组件内部靠前位置 --------------------------------
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const cardWidth = 340;           // 跟 <div className="min-w-[320px] max-w-[340px]"> 保持一致

    // 监听滚动位置，更新按钮可用状态
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        function handle() {
            setCanScrollPrev(el!.scrollLeft > 0);
            setCanScrollNext(el!.scrollLeft + el!.clientWidth < el!.scrollWidth - 1);
        }

        handle();              // 初始执行一次
        el.addEventListener('scroll', handle);
        return () => el.removeEventListener('scroll', handle);
    }, []);
    // -----------------------------------------------------------------

    // 移动端适配
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 600);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);


    const summaryEndRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (!isMobile) return;
        const el = summaryEndRef.current;
        if (!el) return;
        // footer 的高度，保持和 MobileFooter 一致
        const FOOTER_HEIGHT = 84;

        // el 相对整个文档底部的位置
        const rect = el.getBoundingClientRect();
        const absoluteBottom = window.scrollY + rect.bottom;

        // 计算出新的滚动 Y，使得分割线底部正好在视口底部减去 footer
        const targetY = absoluteBottom - window.innerHeight + FOOTER_HEIGHT;

        // 直接定位，不要平滑动画
        window.scrollTo(0, targetY);
    }, [isMobile]);


    // Footer Reveal 逻辑
    const [footerRevealed, setFooterRevealed] = useState(false);
    const footerSentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new window.IntersectionObserver(
            ([entry]) => setFooterRevealed(entry.isIntersecting),
            { root: null, threshold: 0 }
        );
        if (footerSentinelRef.current) observer.observe(footerSentinelRef.current);
        return () => observer.disconnect();
    }, []);

    const router = useRouter();
    const reserveUrl = `/${locale}/reservation`;
    const thumbNail = config.gallery[0] ? config.gallery[0].split('/').pop()! : "g1.jpg";

    // 预订交互状态
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    // mobilecalendar 交互状态
    const [mobileCalOpen, setMobileCalOpen] = useState(false);

    const baseMapSrc = config.location?.mapEmbed.replace(
        'GOOGLEMAPSAPIKEY',
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
    ) ?? '';
    // 检查已有 language 参数，否则拼接
    const mapSrc = baseMapSrc.includes('language=')
        ? baseMapSrc
        : `${baseMapSrc}${baseMapSrc.includes('?') ? '&' : '?'}language=${locale}`;

    const maxGuests = config.summary.guests;
    const HIGHLIGHT_ICONS = [Key, House, MapPin];

    // WhatsApp 点击处理
    const handleWhatsAppClick = () => {
        window.open('https://wa.me/8613910989120', '_blank');
    };


    return (
        <div className="font-sans text-gray-800 scroll-smooth">
            <header
                style={{
                    height: HEADER_HEIGHT - compress,
                    background: stickyNav ? WARM_SAND : 'transparent',
                }}
                className={clsx(
                    'fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 transition-all duration-300 ease-out border-b border-[#E4E0D6]/60',
                    stickyNav ? 'text-gray-900' : 'text-white'
                )}
            >
                {/* ← 左侧：移动端返回首页 */}
                <button
                    className={clsx(
                        'md:hidden p-2 rounded-full hover:bg-gray-100',
                        stickyNav ? 'bg-gray-100/0' : 'bg-gray-100/50'
                    )}
                    onClick={() => {
                        window.location.href = `/${locale}`;
                    }} aria-label="Back to home"
                >
                    <ArrowLeft size={18} />
                </button>

                {/* 中间：标题，移动端居中，桌面端左对齐 */}
                <span className="flex-1 text-center md:text-left text-xl md:text-2xl font-semibold truncate">
                    {config.title}
                </span>

                {/* 右侧：WhatsApp 图标 - 当 main 接触到 header 时显示 */}
                <button
                    className={clsx(
                        'md:hidden p-2 rounded-full hover:bg-gray-100 transition-all duration-300',
                        stickyNav ? 'bg-gray-100/0' : 'bg-gray-100/50',
                        whatsappInHeader ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
                    )}
                    onClick={handleWhatsAppClick}
                    aria-label="Chat on WhatsApp"
                >
                    <FaWhatsapp size={20} />
                </button>

                {/* 桌面端导航保持原状 */}
                <nav className="hidden md:flex gap-6 text-sm">
                    <a href="#gallery" className="hover:underline">
                        {t('headerGallery')}
                    </a>
                    <a href="#details" className="hover:underline">
                        {t('headerHighlights')}
                    </a>
                    <a href="#location" className="hover:underline">
                        {t('headerLocation')}
                    </a>
                </nav>
            </header>

            <section className="sticky top-0 h-screen w-full z-0">
                <Image
                    src={config.hero}
                    alt={config.title} // 更具体的 alt 文本
                    fill
                    priority
                    quality={75} // 添加质量设置
                    sizes="100vw" // 添加响应式尺寸
                    className="object-cover"
                />
            </section>

            <div ref={sentinelRef} className="h-1 w-full" />

            <main ref={mainRef} style={{ backgroundColor: WARM_SAND, paddingBottom: FOOTER_HEIGHT }} className="relative z-10 rounded-t-3xl">

                <button
                    className={clsx(
                        'md:hidden absolute w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-20',
                        whatsappInHeader ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
                    )}
                    style={{
                        top: '12px',    
                        right: '12px',
                    }}
                    onClick={handleWhatsAppClick}
                    aria-label="Chat on WhatsApp"
                >
                    <FaWhatsapp size={20} className="text-white" />
                </button>

                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-20 px-6 py-12">

                    {/* --- BookingCard 组件调用 --- */}
                    {!isMobile && (
                        <aside className="md:w-1/3 w-full order-2 md:order-1 md:sticky md:top-24 md:self-start">
                            <BookingCard
                                propName={propname}
                                apiBase="/api"
                                defaultPrice={config.price}
                                thumbnail={thumbNail}
                                title={config.title}
                                onReserve={(params) =>
                                    router.push(`${reserveUrl}/?${new URLSearchParams(params)}`)
                                }
                                checkIn={checkIn}
                                setCheckIn={setCheckIn}
                                checkOut={checkOut}
                                setCheckOut={setCheckOut}
                                adults={adults}
                                setAdults={setAdults}
                                children={children}
                                setChildren={setChildren}
                                onTotalPriceChange={setTotalPrice}
                                maxGuests={maxGuests}

                            />
                        </aside>
                    )}

                    <div className="md:w-2/3 w-full order-1 md:order-2">

                        {/* Summary Section */}
                        <div className="mb-8 text-center md:text-left mx-auto">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-1 pb-2">
                                {config.subtitle}
                            </h1>
                            <div className="text-lg text-gray-500 font-normal">
                                {config.summary.sqm} ㎡ · {config.summary.guests} {config.summary.guests > 1 ? t('guests') : t('guest')} · {config.summary.bedrooms} {config.summary.bedrooms > 1 ? t('bedrooms') : t('bedroom')}
                                <span className="hidden md:inline"> · </span>
                                <br className="md:hidden" />
                                {config.summary.bathrooms} {config.summary.bathrooms > 1 ? t('bathrooms') : t('bathroom')} · {config.summary.petsAllowed ? t('petsAllowed') : t('petsNotAllowed')}
                            </div>
                        </div>

                        <div
                            ref={summaryEndRef}
                            className="max-w-6xl mx-auto px-6 border-b border-[#E4E0D6]/60 my-2 mb-8"
                        />

                        <Gallery images={config.gallery} />

                        <div className="border-b border-[#E4E0D6]/60 my-8" />

                        <section id="details">
                            <p className="leading-relaxed text-base mb-6">{config.details}</p>

                        </section>

                        <div className="border-b border-[#E4E0D6]/60 my-8" />


                        {/* Highlights Section */}
                        <div className="flex flex-col gap-6 my-8">
                            {Array.isArray(config.highlights) && config.highlights.map((item, idx) => {
                                const Icon = HIGHLIGHT_ICONS[idx] ?? Key;
                                return (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-base text-gray-900 mb-0.5">
                                                {item.heading}
                                            </div>
                                            <div className="text-gray-500 text-base">
                                                {item.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-b border-[#E4E0D6]/60 my-8" />


                        {/* Bedrooms Section */}
                        {config.bedrooms && config.bedrooms.length > 0 && (
                            <section id="bedrooms" className="my-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-6 md:mb-4 text-left">
                                    {t('whatWeOffer')}
                                </h2>

                                {/* Desktop – arrow carousel with floating buttons */}
                                <div className="hidden md:block relative">
                                    {/* Prev btn - 浮动在左侧 */}
                                    <button
                                        onClick={() => scrollRef.current?.scrollBy({ left: -cardWidth, behavior: 'smooth' })}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-gray-300 bg-white/90 hover:bg-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={!canScrollPrev}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {/* Track - 从左边开始，移除 items-center gap */}
                                    <div
                                        ref={scrollRef}
                                        className="flex overflow-x-auto snap-x snap-mandatory gap-6 scrollbar-hide no-scrollbar"
                                    >
                                        {config.bedrooms.map((br, i) => (
                                            <BedroomCard
                                                key={i}
                                                br={br}
                                                index={i}
                                                desktop={true}
                                                allBedrooms={config.bedrooms}
                                            />
                                        ))}
                                    </div>

                                    {/* Next btn - 浮动在右侧 */}
                                    <button
                                        onClick={() => scrollRef.current?.scrollBy({ left: cardWidth, behavior: 'smooth' })}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-gray-300 bg-white/90 hover:bg-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={!canScrollNext}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Mobile – swipe carousel */}
                                <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -ml-4 pl-4 scrollbar-hide no-scrollbar">
                                    {config.bedrooms.map((br, i) => (
                                        <BedroomCard
                                            key={i}
                                            br={br}
                                            index={i}
                                            desktop={false}
                                            allBedrooms={config.bedrooms}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="border-b border-[#E4E0D6]/60 mb-2 mt-4" />

                        {/* Amenities Section */}
                        <Amenities amenities={config.amenities} />

                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6">
                    <div className="border-b border-[#E4E0D6]/60 mt-[-10px] mb-6" />
                </div>

                {/* Location Section */}
                {config.location && (
                    <section id="location" className="max-w-6xl mx-auto px-6 py-6">
                        <h2 className="text-2xl font-semibold mb-4">
                            {t('whereYouBe')}
                        </h2>

                        {/* Google Maps embed */}
                        <iframe
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-96 rounded-2xl border-0"
                            src={mapSrc}   /* ← ① 来自 JSON */
                        />

                        {/* Text block */}
                        <div className="bg-transparent pt-8">
                            <div className="text-base font-semibold text-gray-900 mb-3">
                                {config.location.area}           {/* ← ② 区域名 */}
                            </div>
                            <div className="text-base text-gray-700 leading-relaxed">
                                {config.location.description}    {/* ← ③ 区域特色 */}
                            </div>
                        </div>
                    </section>
                )}

                <div className="max-w-6xl mx-auto px-6">
                    <div className="border-b border-[#E4E0D6]/60 my-2" />
                </div>

                {/* Things to Know Section */}
                <ThingsToKnow
                    summary={config.summary}
                    checkIn={checkIn}
                    locale={locale === "en" || locale === "ja" || locale === "zh" ? locale : "en"}
                />

                <div ref={footerSentinelRef} className="h-1" />

            </main>

            {/* Footer for Desktop, MobileFooter for Mobile */}
            {isMobile ? (
                <MobileFooter
                    price={totalPrice}
                    nights={
                        checkIn && checkOut
                            ? Math.ceil(
                                (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                            : 0
                    }
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={adults + children}
                    isLoading={false}
                    onShowCalendar={() => setMobileCalOpen(true)}
                    onReserve={() =>
                        router.push(
                            `${reserveUrl}/?${new URLSearchParams({
                                propName: propname,
                                checkIn,
                                checkOut,
                                adults: adults + "",
                                children: children + "",
                                nights: (
                                    checkIn && checkOut
                                        ? Math.ceil(
                                            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                                            (1000 * 60 * 60 * 24)
                                        )
                                        : 0
                                ).toString(),
                                total: totalPrice.toString(),
                                img: thumbNail,
                                title: config.title,
                            })}`
                        )
                    }
                    maxGuests={maxGuests}

                />
            ) : (
                <footer
                    className={clsx(
                        "fixed left-0 right-0 bottom-0 z-40 transition-transform duration-500",
                        footerRevealed ? "translate-y-0" : "translate-y-full"
                    )}
                    style={{
                        background: WARM_SAND,
                        color: "#222",
                        height: `${FOOTER_HEIGHT}px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="max-w-6xl mx-auto px-6 text-center w-full">
                        Real Hakuba © {new Date().getFullYear()}. All rights reserved.
                    </div>
                </footer>
            )}

            {isMobile && (
                <Drawer open={mobileCalOpen} onOpenChange={setMobileCalOpen}>
                    <DrawerContent>
                        <DrawerTitle className="sr-only">My Hidden Title</DrawerTitle>
                        <MobileCalendar
                            propName={propname}
                            apiBase="/api"
                            checkIn={checkIn}
                            setCheckIn={setCheckIn}
                            checkOut={checkOut}
                            setCheckOut={setCheckOut}
                            adults={adults}
                            setAdults={setAdults}
                            children={children}
                            setChildren={setChildren}
                            setTotalPrice={setTotalPrice}
                            onCancel={() => setMobileCalOpen(false)}
                            onConfirm={() => setMobileCalOpen(false)}
                        />
                    </DrawerContent>
                </Drawer>
            )}

        </div>
    );
}