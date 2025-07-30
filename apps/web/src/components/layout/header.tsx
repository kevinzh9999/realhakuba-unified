'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactModal from '@/components/features/contact-modal';
import clsx from 'clsx';
import { IoMdClose } from 'react-icons/io';
import { useTranslations, useLocale } from 'next-intl';

import LanguageSwitcher from '@/components/features/language-switcher';
import propsConfig from '@/config/props.config.json';


export default function Header() {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(null);
  const t = useTranslations('Header');
  const locale = useLocale() as 'en' | 'ja';

  const staysRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  /* 点击外部关闭下拉菜单 */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const refs = [staysRef.current, discoverRef.current, aboutRef.current];
        const isClickInside = refs.some(ref => ref && ref.contains(event.target as Node));
        if (!isClickInside) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  /* 平滑滚动并收起菜单 */
  const scrollTo = (id: string) => () => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  /* 处理下拉菜单点击 */
  const handleDropdownClick = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  /* 处理移动端菜单导航 */
  const handleMobileMenuClick = (menu: string) => {
    setMobileActiveMenu(menu);
  };

  const handleMobileBack = () => {
    setMobileActiveMenu(null);
  };

  /* 关闭移动端菜单 */
  const closeMobileMenu = () => {
    setOpen(false);
    setMobileActiveMenu(null);
  };

  /* 导航结构数据 */
  const navigationData = {
    stays: {
      label: t('navStays'),
      items: [
        ...Object.entries(propsConfig).map(([slug, property]) => ({
          name: property.title[locale] || property.title.en || 'Untitled',
          desc: t('propertyDesc', {
            bedrooms: property.summary.bedrooms,
            guests: property.summary.guests
          }), href: `/stays/${slug}`
        })),
        {
          name: t('viewAllProperties'),
          desc: t('viewAllPropertiesDesc'),
          href: '/stays'
        }
      ]
    },
    discover: {
      label: t('navDiscover'),
      sections: [
        {
          title: t('activities'),
          items: [
            {
              name: t('summerActivities'),
              desc: t('summerActivitiesDesc'),
              href: '/discover/summer-activities'
            },
            {
              name: t('winterActivities'),
              desc: t('winterActivitiesDesc'),
              href: '/discover/winter-activities'
            },
          ]
        },
        {
          title: t('explore'),
          items: [
            {
              name: t('attractions'),
              desc: t('attractionsDesc'),
              href: '/discover/attractions'
            },
            {
              name: t('dining'),
              desc: t('diningDesc'),
              href: '/discover/dining'
            },
            {
              name: t('travelGuide'),
              desc: t('travelGuideDesc'),
              href: '/discover/guide'
            },
          ]
        }
      ]
    },
    about: {
      label: t('navAbout'),
      items: [
        /* 
        {
          name: t('ourStory'),
          desc: t('ourStoryDesc'),
          href: '/about/story'
        }, */
        /* {
          name: t('guestReviews'),
          desc: t('guestReviewsDesc'),
          href: '/about/reviews'
        },*/
        {
          name: t('contactUs'),
          desc: t('contactUsDesc'),
          href: '/about/contact',
          isModal: true
        },
        {
          name: t('faq'),
          desc: t('faqDesc'),
          href: '/about/faq'
        },
      ]
    }
  };

  return (
    <>
      {/* 遮罩层：菜单打开时显示，点击它可收起菜单 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white h-[var(--header-h)]'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 h-full">
          <div className="flex h-full items-center justify-between">
            {/* 左组 */}
            <div className="flex items-center">
              {/* 汉堡（移动端） - 调整padding与语言选择器一致 */}
              <button
                onClick={() => setOpen(v => !v)}
                className="md:hidden -ml-1 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-light"
                aria-label={open ? t('menuClose') : t('menuOpen')}
              >
                {open ? (
                  <IoMdClose size={22} style={{ strokeWidth: '1' }} />
                ) : (
                  <Menu size={22} strokeWidth={1.5} />
                )}
              </button>

              {/* 桌面 Logo + 站点名 */}
              <Link href="/" className="hidden md:flex items-center gap-1.5">
                <Image
                  src="/realhakuba-logo.svg"
                  alt=""
                  width={35}
                  height={35}
                />
                <Image
                  src="/realhakuba-text.svg"
                  alt={t('siteName')}
                  width={145}
                  height={38}
                />
              </Link>
            </div>

            {/* 中间：移动端居中 Logo */}
            <Link
              href="/"
              className="md:hidden absolute left-1/2 -translate-x-1/2"
              aria-label={t('home')}
            >
              <Image
                src="/realhakuba-logo.svg"
                alt={t('siteName')}
                width={35}
                height={35}
              />
            </Link>

            {/* 右侧：导航和语言切换 */}
            <div className="flex items-center">
              {/* 桌面导航 */}
              <nav className="hidden md:flex items-center gap-1 mr-3 text-sm">
                {/* Stays 下拉菜单 */}
                <div
                  ref={staysRef}
                  className="relative"
                >
                  <button
                    onClick={() => handleDropdownClick('stays')}
                    className={clsx(
                      "flex items-center gap-1 px-3 h-9 rounded-full transition-all duration-200",
                      activeDropdown === 'stays'
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {navigationData.stays.label}
                    <ChevronDown size={14} className={clsx(
                      "transition-transform duration-200",
                      activeDropdown === 'stays' && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'stays' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100"
                      >
                        <div className="p-2">
                          {navigationData.stays.items.map((item, index) => (
                            <Link
                              key={index}
                              href={item.href}
                              className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className="text-xs font-semibold text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.desc}</div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* About 下拉菜单 */}
                <div
                  ref={aboutRef}
                  className="relative"
                >
                  <button
                    onClick={() => handleDropdownClick('about')}
                    className={clsx(
                      "flex items-center gap-1 px-3 h-9 rounded-full transition-all duration-200",
                      activeDropdown === 'about'
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {navigationData.about.label}
                    <ChevronDown size={14} className={clsx(
                      "transition-transform duration-200",
                      activeDropdown === 'about' && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'about' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100"
                      >
                        <div className="p-2">
                          {navigationData.about.items.map((item, index) => (
                            item.isModal ? (
                              <button
                                key={index}
                                onClick={() => {
                                  setContactOpen(true);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left block px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="text-xs font-semibold text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                              </button>
                            ) : (
                              <Link
                                key={index}
                                href={item.href}
                                className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="text-xs font-semibold text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                              </Link>
                            )
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* 分隔线 */}
              <div className="hidden md:block h-6 w-px bg-gray-200 mr-3" />

              {/* 语言切换器包装 - 移动端加大尺寸，文字变细 */}
              <div className="language-switcher-wrapper md:scale-100 scale-110 md:font-normal font-light">
                <LanguageSwitcher />
              </div>
            </div>
          </div>

          {/* 移动端下拉菜单 */}
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden absolute inset-x-0 top-14 z-60 bg-white border-b border-gray-200 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {/* 第一级菜单 */}
                {!mobileActiveMenu && (
                  <motion.div
                    key="main-menu"
                    initial={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      onClick={() => handleMobileMenuClick('stays')}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                    >
                      <span className="text-sm">{navigationData.stays.label}</span>
                      <ChevronDown className="rotate-[-90deg] text-gray-400" size={14} />
                    </button>

                    <button
                      onClick={() => handleMobileMenuClick('about')}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                    >
                      <span className="text-sm">{navigationData.about.label}</span>
                      <ChevronDown className="rotate-[-90deg] text-gray-400" size={14} />
                    </button>
                  </motion.div>
                )}

                {/* Stays 二级菜单 */}
                {mobileActiveMenu === 'stays' && (
                  <motion.div
                    key="stays-menu"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      onClick={handleMobileBack}
                      className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100"
                    >
                      <ChevronDown className="rotate-90" size={14} />
                      <span className="text-sm font-medium">{navigationData.stays.label}</span>
                    </button>

                    {navigationData.stays.items.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                        onClick={closeMobileMenu}
                      >
                        <div className="text-xs font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}

                {/* About 二级菜单 */}
                {mobileActiveMenu === 'about' && (
                  <motion.div
                    key="about-menu"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <button
                      onClick={handleMobileBack}
                      className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100"
                    >
                      <ChevronDown className="rotate-90" size={14} />
                      <span className="text-sm font-medium">{navigationData.about.label}</span>
                    </button>

                    {navigationData.about.items.map((item, index) => (
                      item.isModal ? (
                        <button
                          key={index}
                          onClick={() => {
                            setContactOpen(true);
                            closeMobileMenu();
                          }}
                          className="w-full text-left block px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <div className="text-xs font-semibold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </button>
                      ) : (
                        <Link
                          key={index}
                          href={item.href}
                          className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                          onClick={closeMobileMenu}
                        >
                          <div className="text-xs font-semibold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </Link>
                      )
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </header>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}