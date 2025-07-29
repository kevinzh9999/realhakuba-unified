// src/app/[locale]/stays/[propname]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import ClientPage from "./ClientPage";

// ------- 类型定义保持不变 -------
export interface PropertySummary {
  sqm: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  petsAllowed: boolean;
}

export interface BedConfig {
  double: number;
  single: number;
  tatami: number;
}

export interface Bedroom {
  image?: string;
  beds: BedConfig;
}

type LocalizedString = { en: string; ja: string; zh: string };
type LocaleKey = keyof LocalizedString;
type HighlightRaw = { heading: LocalizedString; content: LocalizedString };
type HighlightLocalized = { heading: string; content: string };

type PropConfigRaw = {
  title: LocalizedString;
  subtitle?: LocalizedString;
  price: number;
  hero: string;
  gallery: string[];
  details: LocalizedString;
  highlights?: HighlightRaw[];
  summary: PropertySummary;
  bedrooms: Bedroom[];
  location?: {
    mapEmbed: string;
    area: LocalizedString;
    description: LocalizedString;
  };
};

type PropConfigLocalized = {
  title: string;
  subtitle?: string;
  price: number;
  hero: string;
  gallery: string[];
  details: string;
  highlights?: HighlightLocalized[];
  summary: PropertySummary;
  bedrooms: Bedroom[];
  location?: {
    mapEmbed: string;
    area: string;
    description: string;
  };
};

function extractLocalizedConfig(raw: PropConfigRaw, locale: LocaleKey): PropConfigLocalized {
  return {
    ...raw,
    title: raw.title?.[locale] ?? "",
    subtitle: raw.subtitle?.[locale] ?? "",
    details: raw.details?.[locale] ?? "",
    highlights: raw.highlights
      ? raw.highlights.map(h => ({
          heading: h.heading?.[locale] ?? "",
          content: h.content?.[locale] ?? "",
        }))
      : [],
    location: raw.location
      ? {
          ...raw.location,
          area: raw.location.area?.[locale] ?? "",
          description: raw.location.description?.[locale] ?? "",
        }
      : undefined,
  };
}

async function getPropConfig(slug: string, locale: string) {
  const configPath = path.join(process.cwd(), "src/config", "props.config.json");
  const file = await fs.readFile(configPath, "utf-8");
  const propsConfig = JSON.parse(file);
  const raw: PropConfigRaw | undefined = propsConfig[slug];
  if (!raw) return undefined;
  if (locale !== "en" && locale !== "ja" && locale !== "zh") return undefined;
  return extractLocalizedConfig(raw, locale as LocaleKey);
}

// 获取原始配置用于生成完整的元数据
async function getRawPropConfig(slug: string) {
  const configPath = path.join(process.cwd(), "src/config", "props.config.json");
  const file = await fs.readFile(configPath, "utf-8");
  const propsConfig = JSON.parse(file);
  return propsConfig[slug] as PropConfigRaw | undefined;
}

// --------- 增强的 Metadata ---------
export async function generateMetadata(
  { params }: { params: Promise<{ propname: string; locale: string }> }
): Promise<Metadata> {
  const { propname, locale } = await params;
  const rawConfig = await getRawPropConfig(propname);
  const config = await getPropConfig(propname, locale);
  
  if (!config || !rawConfig) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.'
    };
  }

  // 生成多语言的 SEO 优化内容
  const seoData = {
    zh: {
      title: `${config.title} - 白馬民宿預訂 | Real Hakuba`,
      description: `${config.details} 可容納${config.summary.guests}位客人，${config.summary.bedrooms}間臥室，${config.summary.bathrooms}間浴室。${config.location?.area ? `位於${config.location.area}` : ''}。立即預訂享受白馬村的完美住宿體驗。`,
      keywords: `${config.title},白馬住宿,白馬民宿,白馬旅館,${config.location?.area || '白馬村'},白馬滑雪住宿,日本長野住宿`
    },
    en: {
      title: `${config.title} - Hakuba Accommodation Booking | Real Hakuba`,
      description: `${config.details} Sleeps ${config.summary.guests} guests with ${config.summary.bedrooms} bedrooms and ${config.summary.bathrooms} bathrooms. ${config.location?.area ? `Located in ${config.location.area}` : ''}. Book now for the perfect Hakuba Village stay.`,
      keywords: `${config.title},Hakuba accommodation,Hakuba hotels,Hakuba vacation rental,${config.location?.area || 'Hakuba Village'},Hakuba ski lodge,Nagano Japan lodging`
    },
    ja: {
      title: `${config.title} - 白馬 宿泊予約 | Real Hakuba`,
      description: `${config.details} 定員${config.summary.guests}名、寝室${config.summary.bedrooms}室、浴室${config.summary.bathrooms}室。${config.location?.area ? `${config.location.area}に位置` : ''}。白馬村での完璧な滞在をご予約ください。`,
      keywords: `${config.title},白馬 宿泊,白馬 民宿,白馬 旅館,${config.location?.area || '白馬村'},白馬 スキー 宿,長野 宿泊施設`
    }
  };

  const currentSeo = seoData[locale as keyof typeof seoData] || seoData.en;

  return {
    title: currentSeo.title,
    description: currentSeo.description,
    keywords: currentSeo.keywords,
    
    openGraph: {
      title: currentSeo.title,
      description: currentSeo.description,
      images: [
        {
          url: config.hero,
          width: 1200,
          height: 630,
          alt: config.title,
        }
      ],
      type: 'website',
      locale: locale === 'zh' ? 'zh_TW' : locale === 'ja' ? 'ja_JP' : 'en_US',
      siteName: 'Real Hakuba',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: currentSeo.title,
      description: currentSeo.description,
      images: [config.hero],
    },
    
    alternates: {
      canonical: `https://realhakuba.com/${locale}/stays/${propname}`,
      languages: {
        'en': `https://realhakuba.com/en/stays/${propname}`,
        'ja': `https://realhakuba.com/ja/stays/${propname}`,
        'zh': `https://realhakuba.com/zh/stays/${propname}`,
      }
    },
    
    other: {
      'property:price': `¥${config.price}`,
      'property:guests': config.summary.guests.toString(),
      'property:bedrooms': config.summary.bedrooms.toString(),
      'property:bathrooms': config.summary.bathrooms.toString(),
      'property:pets': config.summary.petsAllowed ? 'allowed' : 'not allowed',
    }
  };
}

// -------- 页面主体 ---------
export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propname: string; locale: string }>;
}) {
  const { propname, locale } = await params;
  const config = await getPropConfig(propname, locale);

  if (!config) return notFound();

  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": config.title,
    "description": config.details,
    "image": config.gallery,
    "priceRange": `¥${config.price}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": locale === 'zh' ? "白馬村" : locale === 'ja' ? "白馬村" : "Hakuba Village",
      "addressRegion": locale === 'zh' ? "長野縣" : locale === 'ja' ? "長野県" : "Nagano",
      "addressCountry": locale === 'zh' ? "日本" : locale === 'ja' ? "日本" : "JP"
    },
    "numberOfRooms": config.summary.bedrooms,
    "occupancy": {
      "@type": "QuantitativeValue",
      "maxValue": config.summary.guests,
      "unitText": "guests"
    },
    "petsAllowed": config.summary.petsAllowed,
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": locale === 'zh' ? "WiFi" : locale === 'ja' ? "WiFi" : "WiFi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification", 
        "name": locale === 'zh' ? "廚房" : locale === 'ja' ? "キッチン" : "Kitchen",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": locale === 'zh' ? "洗衣機" : locale === 'ja' ? "洗濯機" : "Washing Machine",
        "value": true
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ClientPage propname={propname} config={config} locale={locale}/>
    </>
  );
}

// 生成静态参数
export async function generateStaticParams() {
  const configPath = path.join(process.cwd(), "src/config", "props.config.json");
  const file = await fs.readFile(configPath, "utf-8");
  const propsConfig = JSON.parse(file);
  const properties = Object.keys(propsConfig);
  const locales = ['en', 'ja', 'zh'];
  
  return locales.flatMap(locale => 
    properties.map(propname => ({
      locale,
      propname
    }))
  );
}