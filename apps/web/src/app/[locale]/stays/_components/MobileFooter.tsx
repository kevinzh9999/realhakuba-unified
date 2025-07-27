"use client";

import React from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

export interface MobileFooterProps {
  price?: number;
  nights?: number;
  checkIn?: string;      // ISO date string
  checkOut?: string;     // ISO date string
  guests?: number;
  isLoading?: boolean;
  onShowCalendar?: (focusDate?: string) => void;
  onReserve?: () => void;
  maxGuests?: number;
}

export const MobileFooter: React.FC<MobileFooterProps> = ({
  price,
  nights,
  checkIn,
  checkOut,
  guests,
  isLoading,
  onShowCalendar,
  onReserve,
  maxGuests,
}) => {
  const t = useTranslations("StaysApp.MobileFooter");

  // Determine whether both check-in and check-out dates are selected
  const hasDate = !!checkIn && !!checkOut;

  // 日期概要：2025-08-01 – 2025-08-03
  let dateSummary = t("selectDates");
  if (checkIn && checkOut) {
    dateSummary = `${checkIn} – ${checkOut}`;
  }

  // Guests summary：1 guest / 2 guests
  let guestsSummary = "";
  if (guests) {
    guestsSummary = t("guestsSummary", { count: guests });
  }

  const hasDates = Boolean(checkIn && checkOut);
  const capacityExceeded =
    hasDates &&
    ((guests ?? 0) > (maxGuests ?? Infinity));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-xl px-4 border-t border-[#E4E0D6]/60 w-full flex items-center justify-between h-[85px]">
      <div className="flex flex-col justify-center flex-1 min-w-0 leading-tight">
        {hasDate ? (
          <>
            <span className="text-lg font-semibold text-gray-900 truncate">
              <button
                type="button"
                className="underline decoration-dotted underline-offset-2 text-lg font-semibold text-gray-900 px-0 py-0 bg-transparent border-0 focus:outline-none cursor-pointer"
                onClick={() => onShowCalendar?.(checkIn)}
                tabIndex={0}
                aria-label={t("editDates")}
                style={{ background: "none" }}
              >
                ¥{price?.toLocaleString()}
              </button>
            </span>
            <span className="text-sm text-gray-500 truncate tracking-[-0em]">
              {dateSummary}
              {guestsSummary ? ` · ${guestsSummary}` : ""}
            </span>
          </>
        ) : (
          <span className="text-base text-gray-700 font-semibold">{t("addDatesForPrices")}</span>
        )}
      </div>

      <button
        disabled={capacityExceeded}
        title={capacityExceeded ? t("maxCapacityExceeded") : undefined}
        className={clsx(
          "ml-4 h-12 rounded-lg w-[150px] text-white font-semibold transition self-center",
          capacityExceeded
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-900"
        )}
        onClick={() => {
          if (!hasDate) {
            onShowCalendar?.(checkIn)
            return
          }
          if (capacityExceeded) return
          onReserve?.()
        }}
      >
        {hasDate ? t("reserve") : t("checkAvailability")}
      </button>
    </div>
  );
};

export default MobileFooter;