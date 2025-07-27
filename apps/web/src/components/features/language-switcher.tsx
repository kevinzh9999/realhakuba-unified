'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Globe } from 'lucide-react'; // 添加地球图标

const LANGS = [
  { locale: 'en', label: 'English' },
  { locale: 'ja', label: '日本語' }
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
        className="flex items-center gap-2 h-9 px-3 rounded-full hover:bg-gray-100 transition-colors text-sm"
        aria-label="Change language"
      >
        <Globe size={16} className="text-gray-600" />
        <span className="text-gray-700">{current.label}</span>
        <svg 
          className={clsx(
            "w-3.5 h-3.5 text-gray-500 transition-transform duration-200",
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
            'absolute right-0 mt-2 w-40 rounded-xl bg-white shadow-xl border border-gray-100',
            'flex flex-col p-1'
          )}
        >
          {LANGS.map(l => (
            <li key={l.locale}  className="px-1">
              <button
                onClick={() => change(l.locale)}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors',
                  l.locale === current.locale && 'font-semibold bg-gray-50'
                )}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}