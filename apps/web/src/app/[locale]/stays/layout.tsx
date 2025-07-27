import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '../../../i18n/routing';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Stays | Real Hakuba',
    template: '%s | Real Hakuba',
  },
  description: 'Authentic stays in Hakuba Village',
};

export default async function StaysLayout({
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
      {/* Stays 特定的脚本 */}
      <Script id="ms_clarity_stays" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "sjyi9dfney");
        `}
      </Script>

      {/* 内容区域 */}
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}