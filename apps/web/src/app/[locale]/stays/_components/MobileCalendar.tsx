"use client";

import React, { useEffect, useState, useRef } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, isBefore, isAfter, isSameDay, addDays, parseISO, addMonths } from "date-fns";
import { useBookingData } from "./useBookingData";
import "react-day-picker/dist/style.css";
import clsx from 'clsx';
import { useTranslations } from "next-intl";

// 可复用 Row 计数器
const Row = ({
    label,
    sub,
    count,
    min,
    onChange,
}: {
    label: string;
    sub: string;
    count: number;
    min: number;
    onChange: (n: number) => void;
}) => (
    <div className="flex items-center justify-between">
        <div>
            <div className="font-semibold text-base">{label}</div>
            <div className="text-xs text-gray-500">{sub}</div>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={() => onChange(Math.max(min, count - 1))}
                className="w-8 h-8 border rounded-full flex items-center justify-center text-lg"
                aria-label={`Decrease ${label}`}
            >
                –
            </button>
            <span className="w-6 text-center">{count}</span>
            <button
                onClick={() => onChange(count + 1)}
                className="w-8 h-8 border rounded-full flex items-center justify-center text-lg"
                aria-label={`Increase ${label}`}
            >
                +
            </button>
        </div>
    </div>
);

export interface MobileCalendarProps {
    propName: string;
    apiBase: string;
    checkIn: string;
    setCheckIn: (s: string) => void;
    checkOut: string;
    setCheckOut: (s: string) => void;
    adults: number;
    setAdults: (n: number) => void;
    children: number;
    setChildren: (n: number) => void;
    setTotalPrice: (totalprice: number) => void;
    onCancel?: () => void;
    onConfirm?: () => void;
}

export const MobileCalendar: React.FC<MobileCalendarProps> = ({
    propName,
    apiBase,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    adults,
    setAdults,
    children,
    setChildren,
    setTotalPrice,
    onCancel,
    onConfirm,
}) => {
    const t = useTranslations("StaysApp.MobileCalendar");

    // useBookingData 内部拉取和管理房态数据
    const {
        disabledDates,
        bookedCheckinSet,
        calcTotalPrice,
        fetchRange,
    } = useBookingData({ propName, apiBase });

    const [calendarMonth, setCalendarMonth] = useState(checkIn ? parseISO(checkIn) : new Date());

    useEffect(() => {
        if (checkIn) {
            const targetMonth = parseISO(checkIn);
            setCalendarMonth(targetMonth);
            fetchRangeWithCache(targetMonth, 3);
        }
    }, [checkIn]);

    // 新增缓存逻辑
    const fetchedMonths = useRef<Set<string>>(new Set());
    const getFetchStart = (targetMonth: Date) => {
        const now = new Date();
        return (targetMonth.getFullYear() === now.getFullYear() && targetMonth.getMonth() === now.getMonth())
            ? now
            : targetMonth;
    };
    const fetchRangeWithCache = (start: Date, months = 3) => {
        for (let i = 0; i < months; i++) {
            const m = addMonths(start, i);
            const ym = format(m, "yyyy-MM");
            if (!fetchedMonths.current.has(ym)) {
                fetchRange(
                    getFetchStart(m),
                    addMonths(m, 1)
                );
                fetchedMonths.current.add(ym);
            }
        }
    };

    useEffect(() => {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        fetchRangeWithCache(thisMonth, 3);
    }, []);

    // 日期区间本地状态（同步父级状态）
    const [range, setRange] = useState<DateRange | undefined>(undefined);

    useEffect(() => {
        if (checkIn) {
            setRange({
                from: parseISO(checkIn),
                to: checkOut ? parseISO(checkOut) : undefined,
            });
        } else {
            setRange(undefined);
        }
    }, [checkIn, checkOut]);

    useEffect(() => {
        if (checkIn && checkOut) {
            setTotalPrice(calcTotalPrice(checkIn, checkOut));
        } else {
            setTotalPrice(0);
        }
    }, [checkIn, checkOut, calcTotalPrice, setTotalPrice]);

    // 禁用逻辑
    const disabledFn = (() => {
        const today = new Date();
        if (!range || !range.from) {
            return (date: Date) =>
                isBefore(date, today) || disabledDates.some(d => isSameDay(d, date));
        }
        return (date: Date) => {
            if (range.from && isSameDay(date, range.from)) return false;
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

    // 日期选择逻辑
    const handleSelect = (r?: DateRange) => {
        setRange(r);
        if (r?.from) setCheckIn(format(r.from, "yyyy-MM-dd"));
        else setCheckIn("");
        if (r?.from && r?.to) setCheckOut(format(r.to, "yyyy-MM-dd"));
        else setCheckOut("");
    };

    const canSave = Boolean(range && range.from && range.to);

    return (
        <div className="w-full h-[540px] flex flex-col bg-white">
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <button
                    className="text-gray-500 underline underline-offset-2 bg-transparent border-0 text-base font-sm p-0 m-0 cursor-pointer"
                    onClick={() => {
                        setRange(undefined);
                        setCheckIn("");
                        setCheckOut("");
                    }}
                    type="button"
                >
                    {t("clearDates")}
                </button>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!canSave}
                    className={clsx(
                        "h-10 px-4 rounded-lg text-white font-semibold transition",
                        canSave
                            ? "bg-black hover:bg-gray-900"
                            : "bg-gray-400 cursor-not-allowed"
                    )}
                >
                    {t("save")}
                </button>
            </div>

            {/* 日历 */}
            <DayPicker
                fixedWeeks={true}
                mode="range"
                numberOfMonths={1}
                selected={range}
                month={calendarMonth}
                onMonthChange={month => {
                    setCalendarMonth(month);
                    fetchRangeWithCache(month, 3);
                }}
                onSelect={handleSelect}
                disabled={disabledFn}
                modifiersClassNames={{
                    disabled: "text-gray-300 line-through cursor-not-allowed",
                }}
                showOutsideDays={false}
                className="!text-[13px] custom-daypicker"
            />

            {/* 人数选择区 */}
            <div className="border-t px-4 py-3 space-y-4 bg-white">
                <Row
                    label={t("adults")}
                    sub={t("adultsAge")}
                    count={adults}
                    min={1}
                    onChange={setAdults}
                />
                <Row
                    label={t("children")}
                    sub={t("childrenAge")}
                    count={children}
                    min={0}
                    onChange={setChildren}
                />
            </div>
        </div>
    );
};

export default MobileCalendar;