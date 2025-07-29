// app/[locale]/about/faq/page.tsx
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import FAQClient from './FAQClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  const metadataByLocale = {
    zh: {
      title: '常見問題 - 白馬民宿預訂 | Real Hakuba',
      description: '查找關於白馬住宿的常見問題解答。包括預訂流程、取消政策、房源設施、交通指南等資訊。',
      keywords: '白馬常見問題,白馬住宿FAQ,白馬民宿問答,白馬旅遊指南'
    },
    en: {
      title: 'FAQ - Hakuba Accommodation | Real Hakuba',
      description: 'Find answers to frequently asked questions about Hakuba accommodation. Including booking process, cancellation policy, property amenities, and transportation guide.',
      keywords: 'Hakuba FAQ,Hakuba accommodation questions,Hakuba travel guide,Hakuba booking help'
    },
    ja: {
      title: 'よくある質問 - 白馬 宿泊予約 | Real Hakuba',
      description: '白馬の宿泊施設に関するよくある質問への回答。予約プロセス、キャンセルポリシー、施設の設備、交通ガイドなど。',
      keywords: '白馬 よくある質問,白馬 宿泊 FAQ,白馬 旅行ガイド,白馬 予約ヘルプ'
    }
  };

  const metadata = metadataByLocale[locale as keyof typeof metadataByLocale] || metadataByLocale.en;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    alternates: {
      canonical: `https://realhakuba.com/${locale}/about/faq`,
      languages: {
        'en': 'https://realhakuba.com/en/about/faq',
        'ja': 'https://realhakuba.com/ja/about/faq',
        'zh': 'https://realhakuba.com/zh/about/faq',
      }
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'website',
      locale: locale === 'zh' ? 'zh_TW' : locale === 'ja' ? 'ja_JP' : 'en_US',
    }
  };
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FAQPage' });

  // 构建结构化数据
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      // 预订相关
      {
        "@type": "Question",
        "name": t('categories.booking.items.checkInOut.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.booking.items.checkInOut.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.booking.items.cancellation.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.booking.items.cancellation.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.booking.items.deposit.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.booking.items.deposit.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.booking.items.reservation.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.booking.items.reservation.answer')
        }
      },
      // 房源设施相关
      {
        "@type": "Question",
        "name": t('categories.property.items.petFriendly.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.property.items.petFriendly.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.property.items.wifi.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.property.items.wifi.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.property.items.linens.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.property.items.linens.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.property.items.hvac.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.property.items.hvac.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.property.items.washing.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.property.items.washing.answer')
        }
      },
      // 交通相关
      {
        "@type": "Question",
        "name": t('categories.transportation.items.fromTokyo.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.transportation.items.fromTokyo.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.transportation.items.needCar.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.transportation.items.needCar.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.transportation.items.parking.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.transportation.items.parking.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.transportation.items.trainStation.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.transportation.items.trainStation.answer')
        }
      },
      // 活动相关
      {
        "@type": "Question",
        "name": t('categories.activities.items.summer.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.activities.items.summer.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.activities.items.skiResorts.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.activities.items.skiResorts.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.activities.items.restaurants.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.activities.items.restaurants.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('categories.activities.items.arrangeActivities.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('categories.activities.items.arrangeActivities.answer')
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <FAQClient />
    </>
  );
}