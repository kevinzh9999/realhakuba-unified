'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiX } from 'react-icons/si';
import Link from 'next/link';
import ContactModal from '@/components/features/contact-modal';
import { useLocale } from 'next-intl';

export default function SectionFooter() {
  const t = useTranslations('SectionFooter');
  const GOOGLEMAPSAPIKEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [contactOpen, setContactOpen] = useState(false);
  const locale = useLocale();

  return (
    <section className="h-screen-dock pt-[calc(var(--header-h)+5px)] w-full snap-start bg-white flex flex-col">
      <div className="mx-4 md:mx-8 py-4 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('aboutTitle')}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link
                href="https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=3100003008127"
                className="hover:underline"
              >
                {t('about.company')}
              </Link>
            </li>
            <li>
              <Link href="legal/disclosure" className="hover:underline">
                {t('about.disclosure')}
              </Link>
            </li>
            <li>
              <Link href="#">{t('about.locals')}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">{t('contactsTitle')}</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="hover:underline"
              >
                {t('contacts.email')}
              </button>
            </li>
            <li>
              <a href="tel:+819079055323" className="hover:underline">
                {t('contacts.phone')}
              </a>
            </li>
            <li>
              <Link href="#">{t('contacts.address')}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-4 md:mx-8 border-t border-gray-200" />

      <div className="flex-1 mx-4 md:mx-8 pt-4 pb-6">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLEMAPSAPIKEY}&q=place_id:ChIJof3aVt3R918Rk4kp5LQM9e4&zoom=16&language=${locale}`}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>

      <div className="mt-auto mx-auto max-w-7xl w-full px-4 py-6 flex items-center text-sm text-gray-500 border-t border-gray-200">
        {/* 左侧：版权和链接 */}
        <div className="flex-1 flex items-center md:gap-2 gap-[5px]">
          <span>© {new Date().getFullYear()} Real Hakuba</span>
          <span className="text-gray-400">·</span>
          <Link href="/legal/terms" className="hover:underline">
            {t('terms')}
          </Link>
          <span className="text-gray-400">·</span>
          <Link href="/legal/privacy" className="hover:underline">
            {t('privacy')}
          </Link>
 
        </div>

        {/* 右侧保持不变 */}
        <div className="flex items-center space-x-6 justify-end">
          <Link href="https://www.facebook.com/profile.php?id=61578575926167" aria-label={t('social.facebook')} className="hover:text-gray-700">
            <FaFacebook size={20} />
          </Link>
          {/* <Link href="#" aria-label={t('social.x')} className="hover:text-gray-700">
            <SiX size={20} />
          </Link> */} 
          <Link href="https://www.instagram.com/realhakuba/" aria-label={t('social.instagram')} className="hover:text-gray-700">
            <FaInstagram size={20} />
          </Link>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}