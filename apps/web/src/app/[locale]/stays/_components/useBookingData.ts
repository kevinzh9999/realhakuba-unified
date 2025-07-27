import { useState, useEffect, useMemo } from "react";
import {
  parseISO,
  startOfDay,
  format,
  addDays,
  differenceInDays,
  eachDayOfInterval,
} from "date-fns";

export interface BookingDataOpts {
  propName: string;
  apiBase: string;
}

export function useBookingData({ propName, apiBase }: BookingDataOpts) {
  type AvailDay = { i: number; p1: number };
  type AvailDict = Record<string, AvailDay>;
  const today = startOfDay(new Date());
  const [availability, setAvailability] = useState<Record<string, any>>({});
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [priceData, setPriceData] = useState<Record<string, number>>({});

  // 拉四个月一次的函数
  const fetchRange = async (from: Date, to: Date) => {
    const res = await fetch(`${apiBase}/beds24/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propName,
        from: format(from, "yyyy-MM-dd"), // 在这里 format
        to: format(to, "yyyy-MM-dd"),
      }),
    }).then((r) => r.json());

    if (!res.ok) return;
    const data = res.data as AvailDict; // 新增断言

    setAvailability((prev) => ({ ...prev, ...res.data }));
    setPriceData((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(data).map(([d, i]) => [d, Number(i.p1)])
      ),
    }));

    const newlyDisabled = Object.entries(data)
      .filter(([, i]) => (i as AvailDay).i === 0)
      .map(
        ([d]) => new Date(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8))
      );

    setDisabledDates((prev) => [...prev, ...newlyDisabled]);

    /* 
    console.log("fetchRange", { from, to });
    console.log(
      "newlyDisabled",
      newlyDisabled.map((d) => d.toISOString().slice(0, 10))
    );
    console.log("res.data", res.data);
    */
  };

  /* 公开的工具函数 */
  const calcTotalPrice = (
    checkIn: string,
    checkOut: string,
    fallback = 28_000
  ) => {
    if (!checkIn || !checkOut) return fallback;
    return eachDayOfInterval({
      start: parseISO(checkIn),
      end: addDays(parseISO(checkOut), -1),
    }).reduce((sum, d) => {
      const key = format(d, "yyyyMMdd");
      return sum + (priceData[key] || fallback);
    }, 0);
  };

  const findBookedCheckinDays = useMemo(() => {
    if (!disabledDates.length) return [];
    const sorted = [...disabledDates].sort((a, b) => +a - +b);
    const firstDays: Date[] = [];
    sorted.forEach((cur, i) => {
      if (i === 0 || differenceInDays(cur, sorted[i - 1]) > 1)
        firstDays.push(cur);
    });
    return firstDays.map((d) => format(d, "yyyy-MM-dd"));
  }, [disabledDates]);

  return {
    availability,
    disabledDates,
    priceData,
    calcTotalPrice,
    bookedCheckinSet: new Set(findBookedCheckinDays),
    fetchRange, // 页面或 DateRangePicker 在月变更时调用
    today,
  };
}
