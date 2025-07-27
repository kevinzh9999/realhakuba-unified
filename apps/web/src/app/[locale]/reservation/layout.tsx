import '../../globals.css';
import { Inter } from 'next/font/google';

import type { Metadata } from 'next';
import { Header, Footer } from '@realhakuba/ui';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

/* ① 替换旧 metadata ------------------------- */
export const metadata: Metadata = {
  title: {
    default: 'Reserve your stay | Real Hakuba',       // 没有下层标题时
    template: '%s | Real Hakuba', // 下层页面传入 title → 替换 %s
  },
  description: 'Book authentic accommodations in Hakuba Village',
};
/* ----------------------------------------- */

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

  // ✅ 只返回内容，不包含 html/body 标签
  return (
    <>
      {/* Google Analytics Scripts - 移动到 head */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XDFLHZR3D5"
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XDFLHZR3D5');
        `}
      </Script>
      <Script id="ms_clarity_reservation" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "sjyi9dfney");
        `}
      </Script>

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