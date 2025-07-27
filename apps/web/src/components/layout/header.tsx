'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import ContactModal from '@/components/features/contact-modal';
import clsx from 'clsx';
import { IoMdClose } from 'react-icons/io';
import { useTranslations } from 'next-intl';

import LanguageSwitcher from '@/components/features/language-switcher';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const t = useTranslations('Header');

  /* 平滑滚动并收起菜单 */
  const scrollTo = (id: string) => () => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  /* 分享 */
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: t('siteName'), url: window.location.href }); // 👈 ③
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const handleContact = () => setContactOpen(true);

  return (
    <>
      {/* —— 遮罩层：菜单打开时显示，点击它可收起菜单 —— */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 border-b border-black/5 backdrop-blur transition-colors h-[var(--header-h)]',
          open ? 'bg-white' : 'bg-white/70'
        )}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-[var(--header-h)] items-center justify-between">
            {/* 左组 */}
            <div className="flex items-center">
              {/* 汉堡（移动端） */}
              <button
                onClick={() => setOpen(v => !v)}
                className="md:hidden -ml-1 pl-0 pr-2 py-2 text-neutral-700/90"
                aria-label={open ? t('menuClose') : t('menuOpen')}
              >
                {open ? <IoMdClose size={20} /> : <Menu size={20} />}
              </button>

              {/* 桌面 Logo + 站点名 */}
              <Link href="#hero" className="hidden md:flex items-center gap-2">
                <Image
                  src="/realhakuba-logo.svg"
                  alt=""
                  width={50}
                  height={50}
                  className="translate-y-[1px]"
                />
                <Image
                  src="/realhakuba-text.svg"
                  alt={t('siteName')}
                  width={207}
                  height={54}
                />
              </Link>

              {/* 桌面导航 */}
              <nav className="hidden md:flex items-center gap-8 ml-8 mt-1 text-base">
                <button
                  onClick={scrollTo('accommodations')}
                  className="hover:opacity-80 text-neutral-700/90"
                >
                  {t('navStays')}                               {/* 👈 ⑤ */}
                </button>
                <button
                  onClick={scrollTo('news')}
                  className="hover:opacity-80 text-neutral-700/90"
                >
                  {t('navFun')}
                </button>
                <button
                  onClick={scrollTo('footer')}
                  className="hover:opacity-80 text-neutral-700/90"
                >
                  {t('navAbout')}
                </button>
              </nav>
            </div>

            {/* 中间：移动端居中 Logo */}
            <Link
              href="#hero"
              className="md:hidden absolute left-1/2 -translate-x-1/2"
              aria-label={t('home')}
            >
              <Image
                src="/realhakuba-logo.svg"
                alt={t('siteName')}
                width={45}
                height={45}
              />
            </Link>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {/* 如需恢复 Share / Contact，再放在这里 */}
            </div>
          </div>

          {/* 移动端下拉菜单 */}
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden absolute inset-x-0 top-14 z-60 bg-white backdrop-blur overflow-hidden"
            >
              <button
                onClick={scrollTo('accommodations')}
                className="block w-full px-4 py-3 text-left hover:bg-black/5"
              >
                {t('navStays')}
              </button>
              <button
                onClick={scrollTo('news')}
                className="block w-full px-4 py-3 text-left hover:bg-black/5"
              >
                {t('navFun')}
              </button>
              <button
                onClick={scrollTo('footer')}
                className="block w-full px-4 py-3 text-left hover:bg-black/5"
              >
                {t('navAbout')}
              </button>
            </motion.div>
          )}
        </div>
      </header>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}