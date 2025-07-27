import '../../globals.css';
import type { Metadata } from 'next';
import { Header, Footer } from '@realhakuba/ui';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = {
  title: {
    default: 'Reserve your stay | Real Hakuba',
    template: '%s | Real Hakuba',
  },
  description: 'Book authentic accommodations in Hakuba Village',
};

export default async function ReservationLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <>
      {/* Header 仅桌面显示 */}
      <div className="hidden md:block">
        <Header title="Reservation" />
      </div>

      {/* 主内容区域 */}
      <div className="pt-0 md:pt-[85px] pb-[30px] md:pb-[100px]">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </div>

      {/* Footer 只桌面显示 */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}