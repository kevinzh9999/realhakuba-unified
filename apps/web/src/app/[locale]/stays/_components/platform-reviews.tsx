"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    Star,
    StarHalf,
    X,
    ExternalLink
} from 'lucide-react';
import { FaAirbnb } from "react-icons/fa";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

// 类型定义
export interface Review {
    id: string;
    author: string;
    avatar?: string;
    rating: number;
    comment: string;
    date: string;
    platform: 'airbnb';
}

export interface PlatformReviews {
    airbnb: {
        rating: number;
        totalReviews: number;
        reviews: Review[];
        platformUrl?: string;
        lastUpdated?: string;
    };
}

interface PlatformReviewsProps {
    reviews: PlatformReviews | null;
}

// 星星评分组件
const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} size={size} className="fill-black text-black" />
            ))}
            {hasHalfStar && (
                <StarHalf size={size} className="fill-black text-black" />
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} size={size} className="text-gray-300" />
            ))}
        </div>
    );
};

// 单个评论卡片组件
const ReviewCard = ({
    review,
    isMobile = false,
    isFirst = false,
    isLast = false,
    onShowMore
}: {
    review: Review;
    isMobile?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    onShowMore?: (review: Review) => void;
}) => {
    const maxLength = 200;
    const isTextTruncated = review.comment.length > maxLength;
    const displayText = isTextTruncated ? review.comment.slice(0, maxLength) + '...' : review.comment;
    const t = useTranslations('StaysApp.Reviews');
    // 日期格式转换函数
    const formatDateToYearMonth = (dateString: string): string => {
        const months: { [key: string]: string } = {
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };

        const match = dateString.match(/(\w+)\s+(\d{4})/);
        if (match) {
            const [, monthName, year] = match;
            const monthNum = months[monthName];
            if (monthNum) {
                return `${year}/${monthNum}`;
            }
        }

        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                return `${year}/${month}`;
            }
        } catch (e) {
            // 解析失败，返回原始字符串
        }

        return dateString;
    };

    return (
        <div className={`px-3 py-4 ${isMobile ? 'min-h-[160px] w-full' : 'min-h-[160px]'} flex flex-col`}>
            <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">{review.author}</span>
                <div className="flex items-center gap-1.5">
                    <StarRating rating={review.rating} size={12} />
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-xs text-gray-500">
                        {formatDateToYearMonth(review.date)}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 mb-3 flex-1">
                    {displayText}
                </p>

                {isTextTruncated && (
                    <div className="mt-auto">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onShowMore?.(review);
                            }}
                            className="text-sm text-gray-900 underline font-medium hover:text-black transition-colors"
                        >
                            {t('showMore', { defaultValue: 'Show more' })}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// 全部评论模态框（桌面端）
const AllReviewsModal = ({
    isOpen,
    onClose,
    reviews,
    rating,
    totalReviews,
    selectedReview
}: {
    isOpen: boolean;
    onClose: () => void;
    reviews: Review[];
    rating: number;
    totalReviews: number;
    selectedReview?: Review | null;
}) => {
    const t = useTranslations('StaysApp.Reviews');

    useEffect(() => {
        if (isOpen) {
            // 保存当前的body样式
            const originalOverflow = document.body.style.overflow;
            const originalPaddingRight = document.body.style.paddingRight;
            
            // 计算滚动条宽度
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // 阻止背景滚动并补偿滚动条宽度
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            if (selectedReview) {
                // 延迟执行滚动，确保模态框已经渲染
                setTimeout(() => {
                    const scrollContainer = document.querySelector('.modal-scroll-container');
                    const element = document.getElementById(`modal-review-${selectedReview.id}`);
                    if (element && scrollContainer) {
                        // 滚动容器内的滚动
                        const containerRect = scrollContainer.getBoundingClientRect();
                        const elementRect = element.getBoundingClientRect();
                        const scrollTop = scrollContainer.scrollTop;
                        const targetScrollTop = scrollTop + elementRect.top - containerRect.top - containerRect.height / 2 + elementRect.height / 2;
                        
                        scrollContainer.scrollTo({
                            top: targetScrollTop,
                            behavior: 'smooth'
                        });
                        
                        // 高亮显示
                        element.style.backgroundColor = '#fef3cd';
                        setTimeout(() => {
                            element.style.backgroundColor = '';
                        }, 2000);
                    }
                }, 300);
            }
            
            // 清理函数
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = originalPaddingRight;
            };
        }
    }, [isOpen, selectedReview]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* 模态框内容 */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col" style={{ maxHeight: '80vh' }}>
                {/* 固定头部 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <FaAirbnb className="text-red-500" size={20} />
                        <span className="font-medium text-red-500">Airbnb</span>
                        <div className="flex items-center gap-2">
                            <StarRating rating={rating} size={18} />
                            <span className="font-semibold text-lg">{rating.toFixed(1)}</span>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-600">
                                {totalReviews} {t('reviews', { defaultValue: 'reviews' })}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* 可滚动内容区域 */}
                <div className="modal-scroll-container flex-1 overflow-y-auto">
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                            {reviews.map((review) => (
                                <div 
                                    key={review.id} 
                                    id={`modal-review-${review.id}`}
                                    className="p-4 transition-colors duration-500 rounded-lg border border-gray-100"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium text-gray-900">{review.author}</span>
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={review.rating} size={14} />
                                            <span className="text-sm text-gray-500">{review.date}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 全部评论抽屉（移动端）
const AllReviewsDrawer = ({
    isOpen,
    onClose,
    reviews,
    rating,
    totalReviews,
    selectedReview
}: {
    isOpen: boolean;
    onClose: () => void;
    reviews: Review[];
    rating: number;
    totalReviews: number;
    selectedReview?: Review | null;
}) => {
    const t = useTranslations('StaysApp.Reviews');

    useEffect(() => {
        if (isOpen && selectedReview) {
            // 延迟执行滚动
            setTimeout(() => {
                const scrollContainer = document.querySelector('.drawer-scroll-container');
                const element = document.getElementById(`drawer-review-${selectedReview.id}`);
                if (element && scrollContainer) {
                    // 滚动容器内的滚动
                    const containerRect = scrollContainer.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    const scrollTop = scrollContainer.scrollTop;
                    const targetScrollTop = scrollTop + elementRect.top - containerRect.top - containerRect.height / 2 + elementRect.height / 2;
                    
                    scrollContainer.scrollTo({
                        top: targetScrollTop,
                        behavior: 'smooth'
                    });
                    
                    element.style.backgroundColor = '#fef3cd';
                    setTimeout(() => {
                        element.style.backgroundColor = '';
                    }, 2000);
                }
            }, 300);
        }
    }, [isOpen, selectedReview]);

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="h-[90vh] flex flex-col">
                {/* 固定头部 */}
                <DrawerHeader className="border-b border-gray-200 flex-shrink-0">
                    <DrawerTitle className="flex items-center gap-3 text-left">
                        <FaAirbnb className="text-red-500" size={20} />
                        <span className="font-medium text-red-500">Airbnb</span>
                        <div className="flex items-center gap-2">
                            <StarRating rating={rating} size={16} />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-600 text-sm">
                                {totalReviews} {t('reviews', { defaultValue: 'reviews' })}
                            </span>
                        </div>
                    </DrawerTitle>
                </DrawerHeader>
                
                {/* 可滚动内容区域 */}
                <div className="drawer-scroll-container flex-1 overflow-y-auto">
                    <div className="px-4 pb-6">
                        <div className="space-y-4 mt-4">
                            {reviews.map((review) => (
                                <div 
                                    key={review.id} 
                                    id={`drawer-review-${review.id}`}
                                    className="border-b border-gray-100 pb-4 last:border-b-0 transition-colors duration-500 rounded-lg"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-medium text-gray-900">{review.author}</span>
                                            <div className="flex items-center gap-2">
                                                <StarRating rating={review.rating} size={14} />
                                                <span className="text-sm text-gray-500">{review.date}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

// 主要的平台评论组件
export default function PlatformReviews({ 
    reviews
}: PlatformReviewsProps) {
    const t = useTranslations('StaysApp.Reviews');
    const [isMobile, setIsMobile] = useState(false);

    // 模态框状态
    const [showAirbnbModal, setShowAirbnbModal] = useState(false);

    // 移动端抽屉状态
    const [showAirbnbDrawer, setShowAirbnbDrawer] = useState(false);

    // 选中的评论
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleShowAllReviews = () => {
        if (isMobile) {
            setShowAirbnbDrawer(true);
        } else {
            setShowAirbnbModal(true);
        }
    };

    const handleShowMoreReview = (review: Review) => {
        setSelectedReview(review);
        handleShowAllReviews();
    };

    // 检查是否有评论数据
    const hasReviews = reviews?.airbnb?.reviews && reviews.airbnb.reviews.length > 0;
    const platformUrl = reviews?.airbnb?.platformUrl;

    return (
        <section className="my-8">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {t('platformReviews', { defaultValue: 'Guest Reviews' })}
                </h2>
            </div>

            {/* Airbnb Reviews 部分 */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <FaAirbnb className="text-red-500" size={24} />
                    
                    {hasReviews ? (
                        <div className="flex items-center gap-2">
                            <StarRating rating={reviews.airbnb.rating} size={14} />
                            <span className="font-semibold text-sm">{reviews.airbnb.rating.toFixed(1)}</span>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-600 text-sm">
                                {reviews.airbnb.totalReviews} {t('reviews', { defaultValue: 'reviews' })}
                            </span>
                            {reviews.airbnb.lastUpdated && (
                                <>

                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-sm">{t('noReviewsYet', { defaultValue: 'No reviews yet' })}</span>
                        </div>
                    )}
                </div>

                {hasReviews ? (
                    <>
                        {/* 桌面端：网格显示前6个 */}
                        <div className="hidden md:block">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                {reviews.airbnb.reviews.slice(0, 6).map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        onShowMore={handleShowMoreReview}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleShowAllReviews}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-800 font-medium flex-shrink-0"
                                >
                                    {t('showAllReviews', { defaultValue: 'Show all {count} reviews', count: reviews.airbnb.totalReviews })}
                                </button>
                                {platformUrl && (
                                    <a
                                        href={platformUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors underline flex-shrink-0"
                                    >
                                        {t('visitOnAirbnb', { defaultValue: 'Visit us on Airbnb' })}
                                        <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* 移动端：横向滚动 */}
                        <div className="md:hidden">
                            <div className="flex overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide -mx-6 px-6">
                                {reviews.airbnb.reviews.map((review, index) => {
                                    const isFirst = index === 0;
                                    const isLast = index === reviews.airbnb.reviews.length - 1;

                                    return (
                                        <div key={review.id} className="shrink-0 snap-start relative flex">
                                            {isFirst && (
                                                <div className="w-[calc(100vw-120px)] pl-6">
                                                    <ReviewCard
                                                        review={review}
                                                        isMobile={true}
                                                        isFirst={true}
                                                        onShowMore={handleShowMoreReview}
                                                    />
                                                </div>
                                            )}

                                            {!isFirst && !isLast && (
                                                <>
                                                    <div className="w-8 shrink-0"></div>
                                                    <div className="w-px bg-gray-200 self-stretch mr-3"></div>
                                                    <div className="w-[calc(100vw-140px)]">
                                                        <ReviewCard
                                                            review={review}
                                                            isMobile={true}
                                                            onShowMore={handleShowMoreReview}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {isLast && (
                                                <>
                                                    <div className="w-8 shrink-0"></div>
                                                    <div className="w-px bg-gray-200 self-stretch mr-3"></div>
                                                    <div className="w-[calc(100vw-120px)] pr-6">
                                                        <ReviewCard
                                                            review={review}
                                                            isMobile={true}
                                                            isLast={true}
                                                            onShowMore={handleShowMoreReview}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <button
                                    onClick={handleShowAllReviews}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-800 font-medium flex-shrink-0"
                                >
                                    {t('showAllReviews', { defaultValue: 'Show all {count} reviews', count: reviews.airbnb.totalReviews })}
                                </button>
                                {platformUrl && (
                                    <a
                                        href={platformUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors underline flex-shrink-0"
                                    >
                                        {t('visitOnAirbnb', { defaultValue: 'Visit us on Airbnb' })}
                                        <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    /* 没有评论时的显示 */
                    <div className="flex items-center justify-center gap-4 py-8">
                        <button
                            disabled
                            className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed flex-shrink-0"
                        >
                            {t('noReviewsYet', { defaultValue: 'No reviews yet' })}
                        </button>
                        
                        {platformUrl && (
                            <a
                                href={platformUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors underline flex-shrink-0"
                            >
                                {t('visitOnAirbnb', { defaultValue: 'Visit us on Airbnb' })}
                                <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* 桌面端模态框 */}
            {hasReviews && (
                <AllReviewsModal
                    isOpen={showAirbnbModal}
                    onClose={() => {
                        setShowAirbnbModal(false);
                        setSelectedReview(null);
                    }}
                    reviews={reviews.airbnb.reviews}
                    rating={reviews.airbnb.rating}
                    totalReviews={reviews.airbnb.totalReviews}
                    selectedReview={selectedReview}
                />
            )}

            {/* 移动端抽屉 */}
            {hasReviews && (
                <AllReviewsDrawer
                    isOpen={showAirbnbDrawer}
                    onClose={() => {
                        setShowAirbnbDrawer(false);
                        setSelectedReview(null);
                    }}
                    reviews={reviews.airbnb.reviews}
                    rating={reviews.airbnb.rating}
                    totalReviews={reviews.airbnb.totalReviews}
                    selectedReview={selectedReview}
                />
            )}
        </section>
    );
}