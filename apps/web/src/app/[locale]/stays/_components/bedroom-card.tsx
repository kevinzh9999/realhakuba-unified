// components/BedroomCard.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { Bed, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface BedroomCardProps {
  br: Bedroom;
  index: number;
  desktop?: boolean;
  allBedrooms?: Bedroom[]; // 新增：用于全屏查看时切换
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

export default function BedroomCard({ 
  br, 
  index, 
  desktop = false, 
  allBedrooms = [] 
}: BedroomCardProps) {
  const t = useTranslations("StaysApp.BedroomCard");
  const [fullscreenImage, setFullscreenImage] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // 获取所有有图片的卧室
  const bedroomsWithImages = allBedrooms.filter(bedroom => bedroom.image);
  const currentImageIndex = bedroomsWithImages.findIndex(bedroom => bedroom.image === br.image);

  // Ensure component is mounted before using portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (fullscreenImage !== null) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [fullscreenImage]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenImage === null) return;
      
      if (e.key === 'ArrowLeft' && fullscreenImage > 0) {
        setFullscreenImage(fullscreenImage - 1);
      } else if (e.key === 'ArrowRight' && fullscreenImage < bedroomsWithImages.length - 1) {
        setFullscreenImage(fullscreenImage + 1);
      } else if (e.key === 'Escape') {
        setFullscreenImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, bedroomsWithImages.length]);

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

  const handleImageClick = () => {
    if (hasImg && currentImageIndex !== -1) {
      setFullscreenImage(currentImageIndex);
    }
  };

  // Fullscreen viewer modal
  const fullscreenModal = fullscreenImage !== null && mounted ? createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
      {/* Black background */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: 'black' 
        }} 
      />
      {/* Viewer */}
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Close button */}
        <button
          onClick={() => setFullscreenImage(null)}
          style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}
          className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image counter */}
        <div 
          style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
          className="bg-black/50 text-white px-3 py-1 rounded-full"
        >
          {fullscreenImage + 1} / {bedroomsWithImages.length}
        </div>

        {/* Previous button */}
        {fullscreenImage > 0 && (
          <button
            onClick={() => setFullscreenImage(fullscreenImage - 1)}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next button */}
        {fullscreenImage < bedroomsWithImages.length - 1 && (
          <button
            onClick={() => setFullscreenImage(fullscreenImage + 1)}
            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Main image */}
        <div 
          style={{ width: '100%', height: '100%', padding: '2rem' }}
          className="relative flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setFullscreenImage(null);
            }
          }}
        >
          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={bedroomsWithImages[fullscreenImage]?.image || ''}
              alt={`${t("bedroom")} ${fullscreenImage + 1}`}
              fill
              sizes="100vw"
              quality={90}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
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
          } w-full aspect-[4/3] rounded-2xl overflow-hidden relative flex items-center justify-center bg-gray-100 ${
            hasImg ? 'cursor-pointer' : ''
          }`}
          onClick={handleImageClick}
        >
          {hasImg ? (
            <Image
              src={br.image as string}
              alt={`${t("bedroom")} ${index + 1}`}
              fill
              sizes={desktop ? "340px" : "80vw"}
              quality={75}
              loading="lazy"
              className="object-cover hover:scale-105 transition-transform duration-300"
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

      {/* Render fullscreen modal */}
      {fullscreenModal}
    </>
  );
}