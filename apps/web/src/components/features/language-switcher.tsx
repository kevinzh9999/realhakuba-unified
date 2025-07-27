'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';

const LANGS = [
  { locale: 'en', flag: '/flags/en.svg', label: 'English' },
  { locale: 'ja', flag: '/flags/ja.svg', label: '日本語' }
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
    // Replace the locale in the pathname and navigate
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
        className="flex items-center gap-1 rounded-md p-1 hover:bg-gray-100"
        aria-label="Change language"
      >
        <Image src={current.flag} alt={current.label} width={24} height={24} />
      </button>

      {open && (
        <ul
          className={clsx(
            'absolute right-0 mt-2 w-28 rounded-md bg-white shadow-lg ring-1 ring-black/5',
            'flex flex-col py-1'
          )}
        >
          {LANGS.map(l => (
            <li key={l.locale}>
              <button
                onClick={() => change(l.locale)}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100',
                  l.locale === current.locale && 'font-semibold'
                )}
              >
                <Image src={l.flag} alt={l.label} width={20} height={20} />
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}