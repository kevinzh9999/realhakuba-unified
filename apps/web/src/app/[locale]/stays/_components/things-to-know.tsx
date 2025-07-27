import React from "react";
import dayjs from "dayjs";
import type { PropertySummary } from "../[propname]/ClientPage";

const LOCALE_TEXT = {
  en: {
    sectionTitle: "Things to know",
    houseRules: "House rules",
    checkIn: "Check-in after 3:00PM",
    checkOut: "Checkout before 10:00AM",
    maxGuests: "guests maximum",
    noSmoking: "No smoking",
    safety: "Safety & property",
    firstAid: "First aid kits available in house",
    smokeAlarm: "Smoke alarm",
    stairs: "Must climb stairs",
    cancellation: "Cancellation policy",
    addDates: "Add your trip dates to see the cancellation details.",
    nonRefundable: "This reservation is non-refundable.",
    lessThan30: "Your check-in date is less than 30 days away.",
    freeCancelUntil: (date: string) => `Free cancellation (full refund) until ${date}.`,
    cancelAfter: (date: string) => `Cancelling on or after ${date} (within 30 days of check-in) will forfeit the full booking amount.`
  },
  ja: {
    sectionTitle: "ご利用にあたって",
    houseRules: "ハウスルール",
    checkIn: "チェックイン 15:00以降",
    checkOut: "チェックアウト 10:00以前",
    maxGuests: "名様まで",
    noSmoking: "禁煙",
    safety: "安全・設備",
    firstAid: "救急箱あり",
    smokeAlarm: "煙探知機あり",
    stairs: "階段の上り下りが必要",
    cancellation: "キャンセルポリシー",
    addDates: "日程を選択するとキャンセル規定が表示されます。",
    nonRefundable: "このご予約は返金不可です。",
    lessThan30: "ご到着日まで30日未満です。",
    freeCancelUntil: (date: string) => `${date}まで無料キャンセル（全額返金）可能です。`,
    cancelAfter: (date: string) => `${date}以降（チェックイン30日前以降）のキャンセルは返金不可となります。`
  }
} as const;

interface ThingsToKnowProps {
  summary: PropertySummary;
  checkIn: string;
  locale: "en" | "ja";
}

export function ThingsToKnow({ summary, checkIn, locale }: ThingsToKnowProps) {
  const t = LOCALE_TEXT[locale];

  return (
    <section className="max-w-6xl mx-auto px-6 py-6">
      <h2 className="text-2xl font-semibold mb-6">{t.sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* House rules */}
        <div>
          <div className="text-base font-semibold mb-4">{t.houseRules}</div>
          <div className="mb-2">{t.checkIn}</div>
          <div className="mb-2">{t.checkOut}</div>
          <div className="mb-2">
            {summary.guests} {t.maxGuests}
          </div>
          <div className="mb-2">{t.noSmoking}</div>
        </div>
        {/* Safety & property */}
        <div>
          <div className="text-base font-semibold mb-4">{t.safety}</div>
          <div className="mb-2">{t.firstAid}</div>
          <div className="mb-2">{t.smokeAlarm}</div>
          <div className="mb-4">{t.stairs}</div>
        </div>
        {/* Cancellation policy */}
        <div>
          <div className="text-base font-semibold mb-4">{t.cancellation}</div>
          {!checkIn ? (
            <div className="mb-2">{t.addDates}</div>
          ) : (() => {
            const today = dayjs();
            const checkDate = dayjs(checkIn);
            const diffDays = checkDate.diff(today, "day");

            if (diffDays <= 30) {
              return (
                <>
                  <div className="mb-2">{t.nonRefundable}</div>
                  <div className="mb-2">{t.lessThan30}</div>
                </>
              );
            }
            const deadline = checkDate.subtract(30, "day").format("YYYY-MM-DD");
            return (
              <>
                <div className="mb-2">{t.freeCancelUntil(deadline)}</div>
                <div className="mb-2">{t.cancelAfter(deadline)}</div>
              </>
            );
          })()}
        </div>
      </div>
    </section>
  );
}