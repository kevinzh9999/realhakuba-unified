'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Globe } from 'lucide-react';

const LANGS = [
  { locale: 'en', label: 'English', short: 'EN' },
  { locale: 'ja', label: '日本語', short: 'JA' }
] as const;

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LANGS.find(l => pathname.startsWith(`/${l.locale}`)) ?? LANGS[0];

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const change = (locale: string) => {
    setOpen(false);
    const segments = pathname.split('/');
    if (LANGS.some(l => l.locale === segments[1])) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    const newPath = segments.join('/') || '/';
    router.push(newPath);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className={clsx(
          "flex items-center gap-1.5 h-9 rounded-full hover:bg-gray-100 transition-colors text-sm",
          // 移动端更紧凑的内边距
          "px-2.5 sm:px-3"
        )}
        aria-label="Change language"
      >
        <Globe className="h-4 w-4 text-gray-600 shrink-0" />
        {/* 桌面端显示完整名称，移动端显示缩写 */}
        <span className="hidden sm:inline text-gray-700">{current.label}</span>
        <span className="sm:hidden text-gray-700 font-medium text-xs">{current.short}</span>
        <svg 
          className={clsx(
            "w-3 h-3 text-gray-500 transition-transform duration-200 shrink-0",
            open && "rotate-180"
          )} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className={clsx(
            'absolute right-0 mt-2 rounded-xl bg-white shadow-xl border border-gray-100',
            'flex flex-col p-1',
            // 移动端下拉菜单宽度调整
            'w-32 sm:w-40'
          )}
        >
          {LANGS.map(l => (
            <li key={l.locale} className="px-1">
              <button
                onClick={() => change(l.locale)}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors',
                  l.locale === current.locale && 'font-semibold bg-gray-50'
                )}
              >
                {/* 下拉菜单中始终显示完整名称 */}
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}