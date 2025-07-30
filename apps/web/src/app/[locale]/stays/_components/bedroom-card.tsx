// components/BedroomCard.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { Bed } from "lucide-react";
import { useTranslations } from "next-intl";

interface BedroomCardProps {
  br: Bedroom;
  index: number;
  desktop?: boolean;
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

export default function BedroomCard({ br, index, desktop = false }: BedroomCardProps) {
  const t = useTranslations("StaysApp.BedroomCard");

  // 组装 bed summary 文本
  const beds: string[] = [];
  if (br.beds.double > 0) {
    beds.push(
      `${br.beds.double} ${br.beds.double > 1 ? t("doubleBeds") : t("doubleBed")}`
    );
  }
  if (br.beds.single > 0) {
    beds.push(
      `${br.beds.single} ${br.beds.single > 1 ? t("singleBeds") : t("singleBed")}`
    );
  }
  if (br.beds.tatami > 0) {
    beds.push(
      `${br.beds.tatami} ${br.beds.tatami > 1 ? t("tatamiFutons") : t("tatamiFuton")}`
    );
  }

  const [broken, setBroken] = useState(false);
  const hasImg = br.image && !broken;

  return (
    <div
      className={
        desktop
          ? "min-w-[320px] max-w-[340px] snap-center shrink-0"
          : "min-w-[80%] snap-center shrink-0"
      }
    >
      <div
        className={`${
          desktop ? "mb-4" : "mb-3"
        } w-full aspect-[4/3] rounded-2xl overflow-hidden relative flex items-center justify-center bg-gray-100`}
      >
        {hasImg ? (
          <Image
            src={br.image as string}
            alt={`${t("bedroom")} ${index + 1}`}
            fill
            sizes={desktop ? "340px" : "80vw"}
            quality={75}
            loading="lazy"
            className="object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <Bed className="w-10 h-10 shrink-0 text-gray-400" />
        )}
      </div>

      <h3 className="font-semibold text-sm mb-0.5">
        {t("bedroom")} {index + 1}
      </h3>
      <p className="text-gray-500 text-sm">{beds.join(" · ")}</p>
    </div>
  );
}