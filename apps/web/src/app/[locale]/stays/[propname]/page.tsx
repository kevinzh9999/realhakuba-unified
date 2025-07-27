// src/app/[locale]/[propname]/page.tsx
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

type LocalizedString = { en: string; ja: string };
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
  if (locale !== "en" && locale !== "ja") return undefined;
  return extractLocalizedConfig(raw, locale as LocaleKey);
}


// --------- Metadata ---------
export async function generateMetadata(
  { params }: { params: Promise<{ propname: string; locale: string }> }
): Promise<Metadata> {
  const { propname, locale } = await params;
  const cfg = await getPropConfig(propname, locale);
  return {
    title: cfg?.title ?? propname.replace(/-/g, " "),
    description: cfg?.details ?? "",
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

  return <ClientPage propname={propname} config={config} locale={locale}/>;
}