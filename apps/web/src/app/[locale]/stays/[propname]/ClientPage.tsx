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
import PlatformReviews, { type PlatformReviews as PlatformReviewsType } from "../_components/platform-reviews";


export interface ClientPageProps {
    propname: string;     
    config: PropConfig;   
    locale: string;
}

export interface PropertySummary {
    sqm: number;        
    guests: number;     
    bedrooms: number;   
    bathrooms: number;  
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
    platformReviews?: PlatformReviewsType; 
}

export interface BedConfig {
    double: number;   
    single: number;   
    tatami: number;   
}

export interface Bedroom {
    image?: string;    
    beds: BedConfig;
}

export default function ClientPage({ propname, config, locale }: ClientPageProps) {
    const mainRef = useRef<HTMLDivElement>(null);
    const [stickyNav, setStickyNav] = useState(false);
    const [compress, setCompress] = useState(0);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [whatsappInHeader, setWhatsappInHeader] = useState(false);

    // 评论数据状态 - 简化版
    const [reviewsData, setReviewsData] = useState<PlatformReviewsType | null>(null);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    const t = useTranslations('StaysApp.ClientPage');

    // 从文件读取评论数据
    const loadReviewsFromFile = async () => {
        setIsLoadingReviews(true);
        
        try {
            console.log('📖 从文件读取评论数据:', propname);
            
            const response = await fetch(`/api/reviews/save?propertyName=${propname}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                console.log('✅ 评论数据读取成功:', result.data);
                
                // 构建符合组件期望的数据结构
                const fileReviewsData: PlatformReviewsType = {
                    airbnb: {
                        rating: result.data.airbnb.rating || 0,
                        totalReviews: result.data.airbnb.totalReviews || 0,
                        reviews: result.data.airbnb.reviews || [],
                        platformUrl: config.platformReviews?.airbnb?.platformUrl || result.data.airbnb.platformUrl,
                        lastUpdated: result.data.airbnb.lastUpdated
                    }
                };
                
                setReviewsData(fileReviewsData);
            } else {
                console.log('📄 没有找到评论文件，使用配置中的数据');
                // 没有文件时使用配置中的数据（如果有）
                if (config.platformReviews) {
                    setReviewsData(config.platformReviews);
                } else {
                    // 完全没有数据时设置为 null，组件会显示 "no reviews yet"
                    setReviewsData(null);
                }
            }
        } catch (error) {
            console.error('❌ 读取评论文件失败:', error);
            // 出错时尝试使用配置中的数据
            if (config.platformReviews) {
                setReviewsData(config.platformReviews);
            } else {
                setReviewsData(null);
            }
        } finally {
            setIsLoadingReviews(false);
        }
    };

    // 页面加载时读取评论数据
    useEffect(() => {
        loadReviewsFromFile();
    }, [propname, config.platformReviews]);

    useEffect(() => {
        const handleScroll = () => {
            if (mainRef.current) {
                const rect = mainRef.current.getBoundingClientRect();
                const isMainTouchingHeader = rect.top <= HEADER_HEIGHT - HEADER_COMP;

                setStickyNav(isMainTouchingHeader);
                setWhatsappInHeader(isMainTouchingHeader);
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

    // 其他现有的滚动逻辑保持不变
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const cardWidth = 340;

    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        function handle() {
            setCanScrollPrev(el!.scrollLeft > 0);
            setCanScrollNext(el!.scrollLeft + el!.clientWidth < el!.scrollWidth - 1);
        }

        handle();
        el.addEventListener('scroll', handle);
        return () => el.removeEventListener('scroll', handle);
    }, []);

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
        const FOOTER_HEIGHT = 84;

        const rect = el.getBoundingClientRect();
        const absoluteBottom = window.scrollY + rect.bottom;
        const targetY = absoluteBottom - window.innerHeight + FOOTER_HEIGHT;

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

                <span className="flex-1 text-center md:text-left text-xl md:text-2xl font-semibold truncate">
                    {config.title}
                </span>

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
                    alt={config.title}
                    fill
                    priority
                    quality={75}
                    sizes="100vw"
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

                        {/* Bedrooms Section */}
                        {config.bedrooms && config.bedrooms.length > 0 && (
                            <section id="bedrooms" className="my-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-6 md:mb-4 text-left">
                                    {t('whatWeOffer')}
                                </h2>

                                <div className="hidden md:block relative">
                                    <button
                                        onClick={() => scrollRef.current?.scrollBy({ left: -cardWidth, behavior: 'smooth' })}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-gray-300 bg-white/90 hover:bg-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={!canScrollPrev}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

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

                                    <button
                                        onClick={() => scrollRef.current?.scrollBy({ left: cardWidth, behavior: 'smooth' })}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-gray-300 bg-white/90 hover:bg-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={!canScrollNext}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

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

                        <iframe
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-96 rounded-2xl border-0"
                            src={mapSrc}
                        />

                        <div className="bg-transparent pt-8">
                            <div className="text-base font-semibold text-gray-900 mb-3">
                                {config.location.area}
                            </div>
                            <div className="text-base text-gray-700 leading-relaxed">
                                {config.location.description}
                            </div>
                        </div>
                    </section>
                )}

                <div className="max-w-6xl mx-auto px-6">
                    <div className="border-b border-[#E4E0D6]/60 my-2" />
                </div>

                {/* Platform Reviews Section - 使用文件中的数据 */}
                <div className="max-w-6xl mx-auto px-6 py-0">
                    {isLoadingReviews && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading reviews...</p>
                        </div>
                    )}
                    
                    {!isLoadingReviews && (
                        <PlatformReviews 
                            reviews={reviewsData} 
                        />
                    )}
                </div>

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