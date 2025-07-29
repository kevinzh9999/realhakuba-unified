import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import '../globals.css';
import { Inter, Noto_Sans_JP, Noto_Sans_SC } from 'next/font/google';
import Script from 'next/script';
import { routing } from '../../i18n/routing';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});
const notoSansSC = Noto_Sans_SC({ 
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

// 多语言元数据
const metadataByLocale = {
  zh: {
    title: {
      default: '白马民宿预订 | 白马村住宿 | Real Hakuba',
      template: '%s | Real Hakuba 白马民宿',
    },
    description: '预订白马村最优质的民宿和旅馆。提供白马滑雪住宿、温泉旅馆、家庭度假屋。靠近八方尾根、五龙、白马47滑雪场。',
    keywords: '白马民宿,白马住宿,白马旅馆,白马滑雪,白马村住宿,日本白马,长野白马,白马温泉旅馆',
  },
  en: {
    title: {
      default: 'Hakuba Accommodation | Hotels & Vacation Rentals | Real Hakuba',
      template: '%s | Real Hakuba',
    },
    description: 'Book the best Hakuba accommodation. Ski lodges, vacation rentals, and hotels near Happo-One, Goryu, and Hakuba 47 ski resorts.',
    keywords: 'Hakuba accommodation,Hakuba hotels,Hakuba vacation rental,Hakuba ski lodge,Hakuba Japan,Nagano accommodation',
  },
  ja: {
    title: {
      default: '白馬 宿泊予約 | 白馬村の民宿・旅館 | Real Hakuba',
      template: '%s | Real Hakuba 白馬',
    },
    description: '白馬村の上質な宿泊施設をご予約。スキー場近くの民宿、温泉旅館、貸別荘。八方尾根、五竜、白馬47へ好アクセス。',
    keywords: '白馬 宿泊,白馬 民宿,白馬 旅館,白馬 スキー 宿,白馬村 宿泊施設,長野 白馬,白馬バレー ホテル',
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const metadata = metadataByLocale[locale as keyof typeof metadataByLocale] || metadataByLocale.en;
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    authors: [{ name: 'Real Hakuba' }],
    creator: 'Real Hakuba',
    publisher: 'Real Hakuba',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://realhakuba.com'),
    alternates: {
      canonical: `https://realhakuba.com/${locale}`,
      languages: {
        'en': 'https://realhakuba.com/en',
        'ja': 'https://realhakuba.com/ja',
        'zh': 'https://realhakuba.com/zh',
      }
    },
    openGraph: {
      title: metadata.title.default,
      description: metadata.description,
      url: `https://realhakuba.com/${locale}`,
      siteName: 'Real Hakuba',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: locale === 'zh' ? '白马村民宿' : locale === 'ja' ? '白馬村の宿泊施設' : 'Hakuba Accommodation'
        }
      ],
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title.default,
      description: metadata.description,
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // google: 'your-google-verification-code', // 已验证，无需
      // yandex: 'your-yandex-verification-code',
      // baidu: 'your-baidu-verification-code', // 如果需要百度
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  // 根据语言选择字体
  const fontClass = locale === 'ja' 
    ? `${inter.className} ${notoSansJP.variable}` 
    : locale === 'zh'
    ? `${inter.className} ${notoSansSC.variable}`
    : inter.className;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              "name": locale === 'zh' ? "Real Hakuba 白马民宿" : locale === 'ja' ? "Real Hakuba 白馬宿泊施設" : "Real Hakuba",
              "description": metadataByLocale[locale as keyof typeof metadataByLocale]?.description || metadataByLocale.en.description,
              "url": `https://realhakuba.com/${locale}`,
              "logo": "https://realhakuba.com/logo.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": locale === 'zh' ? "北城2546" : locale === 'ja' ? "北城2546" : "2546 Hokujo",
                "addressLocality": locale === 'zh' ? "白马村" : locale === 'ja' ? "白馬村" : "Hakuba",
                "addressRegion": locale === 'zh' ? "长野县" : locale === 'ja' ? "長野県" : "Nagano",
                "postalCode": "399-9301",
                "addressCountry": locale === 'zh' ? "日本" : locale === 'ja' ? "日本" : "JP"
              },
              "priceRange": "¥¥¥",
              "telephone": "+81-90-7905-5323",
              "email": "inquiry@realhakuba.com",
              "sameAs": [
                "https://www.facebook.com/realhakuba",
                "https://www.instagram.com/realhakuba"
              ]
            })
          }}
        />

        {/* Hreflang 标签 */}
        <link rel="alternate" hrefLang="en" href="https://realhakuba.com/en" />
        <link rel="alternate" hrefLang="ja" href="https://realhakuba.com/ja" />
        <link rel="alternate" hrefLang="zh" href="https://realhakuba.com/zh" />
        <link rel="alternate" hrefLang="x-default" href="https://realhakuba.com/en" />

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XDFLHZR3D5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XDFLHZR3D5', {
              page_title: document.title,
              page_location: window.location.href,
              page_language: '${locale}',
              send_page_view: true
            });
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "sjyi9dfney");
          `}
        </Script>
      </head>

      <body className={`${fontClass} min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <main className="flex-1">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}