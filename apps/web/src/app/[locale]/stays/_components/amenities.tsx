"use client";

import { useState, useEffect } from "react";
import { 
  Wifi, UtensilsCrossed, WashingMachine, Projector, House, Key, MapPin,
  Car, Bath, Snowflake, Wind, Tv, Coffee, Utensils, Waves, 
  TreePine, Shield, Baby, PawPrint, Cigarette, Flame, 
  Thermometer, Sun, Moon, Volume2, Camera, Dumbbell,
  Gamepad2, BookOpen, Music, Flower2, X
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// 完整的设施图标映射
const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  kitchen: UtensilsCrossed,
  washer: WashingMachine,
  dryer: WashingMachine,
  projector: Projector,
  loghouse: House,
  selfCheckIn: Key,
  goodLocation: MapPin,
  parking: Car,
  bathtub: Bath,
  airConditioning: Snowflake,
  heating: Thermometer,
  tv: Tv,
  coffee: Coffee,
  dishwasher: Utensils,
  hotTub: Waves,
  garden: TreePine,
  security: Shield,
  babyFriendly: Baby,
  petFriendly: PawPrint,
  smoking: Cigarette,
  fireplace: Flame,
  balcony: Sun,
  terrace: Moon,
  soundSystem: Volume2,
  securityCamera: Camera,
  gym: Dumbbell,
  gameRoom: Gamepad2,
  library: BookOpen,
  piano: Music,
  bbq: Flower2,
};

interface AmenitiesProps {
  amenities?: Record<string, boolean>;
}

export default function Amenities({ amenities = {} }: AmenitiesProps) {
  const t = useTranslations("StaysApp.Amenities");
  const [showAllModal, setShowAllModal] = useState(false);
  const [showAllDrawer, setShowAllDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 获取可用的设施
  const availableAmenities = Object.entries(amenities)
    .filter(([_, available]) => available)
    .map(([key, _]) => ({
      key,
      icon: AMENITY_ICONS[key] || House,
      label: t(key)
    }));

  const displayedAmenities = availableAmenities.slice(0, 10); // 显示前10个（5行2列）
  const hasMore = availableAmenities.length > 10;

  const handleShowAll = () => {
    if (isMobile) {
      setShowAllDrawer(true);
    } else {
      setShowAllModal(true);
    }
  };

  const AmenityItem = ({ amenity, className = "" }: { amenity: any, className?: string }) => {
    const Icon = amenity.icon;
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Icon className="w-5 h-5 text-gray-500 shrink-0" />
        <span className="text-sm text-gray-700">{amenity.label}</span>
      </div>
    );
  };

  const AllAmenitiesGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
      {availableAmenities.map((amenity) => (
        <AmenityItem key={amenity.key} amenity={amenity} />
      ))}
    </div>
  );

  if (availableAmenities.length === 0) {
    return null; // 如果没有设施，不显示这个部分
  }

  return (
    <>
      <section className="mt-8 mb-2">

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-8">
          {displayedAmenities.map((amenity) => (
            <AmenityItem key={amenity.key} amenity={amenity} />
          ))}
        </div>

        {hasMore && (
          <button
            onClick={handleShowAll}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-800 font-medium"
          >
            {t('showAll', { count: availableAmenities.length })}
          </button>
        )}
      </section>

      {/* 桌面端模态框 - 使用自定义实现 */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAllModal(false)}
          />
          
          {/* 模态框内容 */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('whatThisPlaceOffers')}
              </h2>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* 内容 */}
            <div className="p-6">
              <AllAmenitiesGrid />
            </div>
          </div>
        </div>
      )}

      {/* 移动端抽屉 */}
      <Drawer open={showAllDrawer} onOpenChange={setShowAllDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-xl font-semibold text-left">
              {t('whatThisPlaceOffers')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <AllAmenitiesGrid />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}