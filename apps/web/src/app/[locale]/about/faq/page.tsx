'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ContactModal from '@/components/features/contact-modal';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    title: string;
    items: FAQItem[];
}

export default function FAQPage() {
    const t = useTranslations('FAQPage');
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    // 使用翻译构建 FAQ 数据
    const faqCategories: FAQCategory[] = [
        {
            title: t('categories.booking.title'),
            items: [
                {
                    question: t('categories.booking.items.checkInOut.question'),
                    answer: t('categories.booking.items.checkInOut.answer')
                },
                {
                    question: t('categories.booking.items.cancellation.question'),
                    answer: t('categories.booking.items.cancellation.answer')
                },
                {
                    question: t('categories.booking.items.deposit.question'),
                    answer: t('categories.booking.items.deposit.answer')
                },
                {
                    question: t('categories.booking.items.reservation.question'),
                    answer: t('categories.booking.items.reservation.answer')
                }
            ]
        },
        {
            title: t('categories.property.title'),
            items: [
                {
                    question: t('categories.property.items.petFriendly.question'),
                    answer: t('categories.property.items.petFriendly.answer')
                },
                {
                    question: t('categories.property.items.wifi.question'),
                    answer: t('categories.property.items.wifi.answer')
                },
                {
                    question: t('categories.property.items.linens.question'),
                    answer: t('categories.property.items.linens.answer')
                },
                {
                    question: t('categories.property.items.hvac.question'),
                    answer: t('categories.property.items.hvac.answer')
                },
                {
                    question: t('categories.property.items.washing.question'),
                    answer: t('categories.property.items.washing.answer')
                }
            ]
        },
        {
            title: t('categories.transportation.title'),
            items: [
                {
                    question: t('categories.transportation.items.fromTokyo.question'),
                    answer: t('categories.transportation.items.fromTokyo.answer')
                },
                {
                    question: t('categories.transportation.items.needCar.question'),
                    answer: t('categories.transportation.items.needCar.answer')
                },
                {
                    question: t('categories.transportation.items.parking.question'),
                    answer: t('categories.transportation.items.parking.answer')
                },
                {
                    question: t('categories.transportation.items.trainStation.question'),
                    answer: t('categories.transportation.items.trainStation.answer')
                }
            ]
        },
        {
            title: t('categories.activities.title'),
            items: [
                {
                    question: t('categories.activities.items.summer.question'),
                    answer: t('categories.activities.items.summer.answer')
                },
                {
                    question: t('categories.activities.items.skiResorts.question'),
                    answer: t('categories.activities.items.skiResorts.answer')
                },
                {
                    question: t('categories.activities.items.restaurants.question'),
                    answer: t('categories.activities.items.restaurants.answer')
                },
                {
                    question: t('categories.activities.items.arrangeActivities.question'),
                    answer: t('categories.activities.items.arrangeActivities.answer')
                }
            ]
        }
    ];

    const toggleItem = (categoryIndex: number, itemIndex: number) => {
        const key = `${categoryIndex}-${itemIndex}`;
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(key)) {
            newOpenItems.delete(key);
        } else {
            newOpenItems.add(key);
        }
        setOpenItems(newOpenItems);
    };

    const filteredCategories = faqCategories.map(category => ({
        ...category,
        items: category.items.filter(
            item =>
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white">
                {/* Header */}
                <div className="border-b border-gray-200 pt-14">
                    <div className="max-w-7xl mx-auto px-6 py-8 md:py-8">
                        <h1 className="text-xl md:text-4xl font-semibold text-gray-900">
                            {t('title')}
                        </h1>
                        <p className="mt-4 text-base text-gray-600 max-w-3xl">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="max-w-7xl mx-auto px-6 pb-24">
                    <div className="max-w-3xl">
                        {filteredCategories.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">{t('noResults', { query: searchQuery })}</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 text-gray-900 underline hover:no-underline"
                                >
                                    {t('clearSearch')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {filteredCategories.map((category, categoryIndex) => (
                                    <div key={categoryIndex}>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                            {category.title}
                                        </h2>
                                        <div className="space-y-0 divide-y divide-gray-200">
                                            {category.items.map((item, itemIndex) => {
                                                const isOpen = openItems.has(`${categoryIndex}-${itemIndex}`);
                                                return (
                                                    <motion.div
                                                        key={itemIndex}
                                                        initial={false}
                                                        className="py-6"
                                                    >
                                                        <button
                                                            onClick={() => toggleItem(categoryIndex, itemIndex)}
                                                            className="w-full flex items-start justify-between text-left group"
                                                        >
                                                            <h3 className="text-sm font-medium text-gray-900 pr-8 group-hover:text-gray-600 transition-colors">
                                                                {item.question}
                                                            </h3>
                                                            <div className="flex-shrink-0 ml-2">
                                                                {isOpen ? (
                                                                    <Minus className="h-5 w-5 text-gray-400" />
                                                                ) : (
                                                                    <Plus className="h-5 w-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                        </button>
                                                        <AnimatePresence initial={false}>
                                                            {isOpen && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="pt-4 pr-12">
                                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                                            {item.answer}
                                                                        </p>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-16 pt-16 border-t border-gray-200">
                        <div className="max-w-3xl">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {t('stillHaveQuestions')}
                            </h2>
                            <p className="text-sm text-gray-600 mb-8">
                                {t('hereToHelp')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setContactModalOpen(true)}
                                    className="inline-flex items-center px-5 py-2.5 text-sm border border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
                                >
                                    {t('contactUs')}
                                </button>
                                <Link
                                    href="/stays"
                                    className="inline-flex items-center px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    {t('viewProperties')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 添加 ContactModal */}
            <ContactModal
                open={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
            />

            <Footer />
        </>
    );
}