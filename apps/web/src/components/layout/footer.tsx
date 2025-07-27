'use client';

import { useTranslations } from 'next-intl';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiX } from 'react-icons/si';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('SectionFooter');

  return (
    <footer className="mt-auto mx-auto max-w-7xl w-full px-4 py-6 flex items-center text-sm text-gray-500 border-t border-gray-200">
      <div className="flex-1">
        {t('copyright', { year: new Date().getFullYear() })}
      </div>

      <div className="flex items-center space-x-6 justify-end">
        <Link href="#" aria-label={t('social.facebook')} className="hover:text-gray-700">
          <FaFacebook size={20} />
        </Link>
        <Link href="#" aria-label={t('social.x')} className="hover:text-gray-700">
          <SiX size={20} />
        </Link>
        <Link href="#" aria-label={t('social.instagram')} className="hover:text-gray-700">
          <FaInstagram size={20} />
        </Link>
      </div>
    </footer>
  );
}