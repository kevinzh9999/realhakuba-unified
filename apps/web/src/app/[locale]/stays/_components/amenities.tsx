// components/Amenities.tsx
"use client";

import { Wifi, UtensilsCrossed, WashingMachine, Projector, House, Key, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

const AMENITIES = [
  { icon: Wifi,        key: "wifi" },
  { icon: UtensilsCrossed, key: "kitchen" },
  { icon: WashingMachine,  key: "washer" },
  { icon: Projector,       key: "projector" },
  { icon: House,           key: "loghouse" },
  { icon: Key,             key: "selfCheckIn" },
  { icon: MapPin,          key: "goodLocation" },
];

export default function Amenities() {
  const t = useTranslations("StaysApp.Amenities");

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-5 my-2">
      {AMENITIES.map(({ icon: Icon, key }) => (
        <div className="flex items-center gap-3" key={key}>
          <Icon className="w-5 h-5 text-gray-500 shrink-0" />
          <span className="text-sm text-gray-700">{t(key)}</span>
        </div>
      ))}
    </div>
  );
}