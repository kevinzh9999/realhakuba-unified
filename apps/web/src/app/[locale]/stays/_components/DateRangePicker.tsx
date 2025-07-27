"use client";

import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from "date-fns";
import "react-day-picker/dist/style.css";
import { useTranslations } from "next-intl";

export interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onChange: (ci: string, co: string) => void;
  disabledDates: Date[];
  bookedCheckinSet: Set<string>;
  onClose: () => void;
  fetchRange: (start: Date, months?: number) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  checkIn,
  checkOut,
  onChange,
  disabledDates,
  bookedCheckinSet,
  onClose,
  fetchRange,
}) => {
  const t = useTranslations("StaysApp.DateRangePicker");

  type Range = { from: Date | undefined; to: Date | undefined };
  const EMPTY_RANGE: Range = { from: undefined, to: undefined };
  const [range, setRange] = useState<Range>(EMPTY_RANGE);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  useEffect(() => {
    const from = checkIn ? parseISO(checkIn) : undefined;
    const to = checkOut ? parseISO(checkOut) : undefined;
    setRange({ from, to });
    setCalendarMonth(from ?? new Date());
  }, [checkIn, checkOut]);

  const nights =
    range.from && range.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;

  // 禁用算法
  const disabledFn = (() => {
    const today = new Date();
    if (!range.from) {
      return (date: Date) =>
        isBefore(date, today) || disabledDates.some(d => isSameDay(d, date));
    }
    return (date: Date) => {
      if (isSameDay(date, range.from!)) return false;
      if (isBefore(date, today)) return true;
      const dateStr = format(date, "yyyy-MM-dd");
      if (
        disabledDates.some(d => isSameDay(d, date)) &&
        bookedCheckinSet.has(dateStr) &&
        isAfter(date, range.from!)
      ) {
        let cur = addDays(range.from!, 1);
        while (isBefore(cur, date)) {
          if (disabledDates.some(d => isSameDay(d, cur))) return true;
          cur = addDays(cur, 1);
        }
        return false;
      }
      if (disabledDates.some(d => isSameDay(d, date))) return true;
      const [start, end] = isAfter(date, range.from!)
        ? [range.from!, date]
        : [date, range.from!];
      let cur = addDays(start, 1);
      while (isBefore(cur, end)) {
        if (disabledDates.some(d => isSameDay(d, cur))) return true;
        cur = addDays(cur, 1);
      }
      return false;
    };
  })();

  // 选择逻辑
  const handleSelect = (r?: { from?: Date; to?: Date }) => {
    setRange(
      r && "from" in r && "to" in r
        ? { from: r.from ?? undefined, to: r.to ?? undefined }
        : EMPTY_RANGE
    );
    if (r?.from && r.to) {
      onChange(format(r.from, "yyyy-MM-dd"), format(r.to, "yyyy-MM-dd"));
    }
  };

  const clearDates = () => {
    setRange(EMPTY_RANGE);
    onChange("", "");
  };

  return (
    <div className="absolute z-30 bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
      <h3 className="text-base font-semibold mb-0.5">
        {range.from && range.to
          ? t("nights", { count: nights })
          : t("selectDates")}
      </h3>
      <p className="text-xs text-gray-500 mb-5">
        {range.from && range.to
          ? `${format(range.from, "yyyy-MM-dd")} – ${format(
              range.to!,
              "yyyy-MM-dd"
            )}`
          : t("addDatesHint")}
      </p>
      <div className="grid grid-cols-2 divide-x border rounded-lg overflow-hidden mb-5 bg-white text-xs">
        <div className="p-2">
          <span className="uppercase tracking-widest text-[10px] font-bold block mb-1">
            {t("checkIn")}
          </span>
          <span>{checkIn || "––"}</span>
        </div>
        <div className="p-2">
          <span className="uppercase tracking-widest text-[10px] font-bold block mb-1">
            {t("checkOut")}
          </span>
          <span>{checkOut || "––"}</span>
        </div>
      </div>
      <DayPicker
        fixedWeeks={true}
        mode="range"
        numberOfMonths={1}
        selected={range}
        month={calendarMonth}
        onMonthChange={month => {
          setCalendarMonth(month);
          fetchRange(month, 3);
        }}
        onSelect={handleSelect}
        disabled={disabledFn}
        modifiersClassNames={{
          disabled: "text-gray-300 line-through cursor-not-allowed",
        }}
        className="!text-[13px] custom-daypicker"
      />
      <div className="mt-5 flex justify-between items-center text-xs">
        <button onClick={clearDates} className="underline">
          {t("clearDates")}
        </button>
        <button onClick={onClose} className="bg-black text-white px-4 py-2 rounded-lg">
          {t("close")}
        </button>
      </div>
    </div>
  );
};