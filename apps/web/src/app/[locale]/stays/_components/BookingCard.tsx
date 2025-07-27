"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { addMonths, format, parseISO } from "date-fns";

import clsx from "clsx";
import { useTranslations } from "next-intl";

import { DateRangePicker } from "./DateRangePicker";
import { useBookingData } from "./useBookingData";

export interface BookingCardProps {
    // 房源配置参数
    propName: string;
    apiBase: string;
    defaultPrice: number;
    thumbnail: string;
    title: string;
    onReserve: (params: Record<string, string>) => void;
    // 预订交互状态
    checkIn: string;
    setCheckIn: (v: string) => void;
    checkOut: string;
    setCheckOut: (v: string) => void;
    adults: number;
    setAdults: (n: number) => void;
    children: number;
    setChildren: (n: number) => void;
    onTotalPriceChange?: (total: number) => void; // 新增回调函数
    maxGuests: number;

}

export const BookingCard: React.FC<BookingCardProps> = ({
    propName,
    apiBase,
    defaultPrice,
    thumbnail,
    title,
    onReserve,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    adults,
    setAdults,
    children,
    setChildren,
    onTotalPriceChange, // 新增回调函数
    maxGuests,
}) => {
    // 全局数据（API + util）
    const {
        disabledDates,
        bookedCheckinSet,
        fetchRange,
        calcTotalPrice,
    } = useBookingData({ propName, apiBase });

    // 多语言翻译
    const t = useTranslations("StaysApp.BookingCard");

    // 本地 UI 状态
    const [showCal, setShowCal] = useState(false);
    const [showGuest, setShowGuest] = useState(false);

    const totalGuests = adults + children;
    const capacityExceeded = Boolean(checkIn && checkOut && totalGuests > maxGuests);

    // 价格和夜数
    const nights =
        checkIn && checkOut
            ? Math.max(
                1,
                Math.ceil(
                    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                    86_400_000
                )
            )
            : 1;

    const total =
        checkIn && checkOut
            ? calcTotalPrice(checkIn, checkOut)
            : defaultPrice;

    // 用 useEffect 通知父级
    useEffect(() => {
        onTotalPriceChange?.(checkIn && checkOut ? total : 0);
    }, [checkIn, checkOut, total, onTotalPriceChange]);


    const fetchedMonths = useRef<Set<string>>(new Set());
    const getFetchStart = (targetMonth: Date) => {
        const now = new Date();
        return (targetMonth.getFullYear() === now.getFullYear() && targetMonth.getMonth() === now.getMonth())
            ? now // 本月从今天开始
            : targetMonth; // 其他月从1号开始
    };
    const fetchRangeWithCache = (start: Date, months = 4) => {
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
        // 强制从本月1号开始拉
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        fetchRangeWithCache(thisMonth, 3);
    }, []);

    // 监听窗口宽度，决定 mobile/desktop 弹窗策略（可选，inline版其实用不到）
    // const [isMobile, setIsMobile] = useState(false);
    // useEffect(() => {
    //   const update = () => setIsMobile(window.innerWidth < 600);
    //   update();
    //   window.addEventListener("resize", update);
    //   return () => window.removeEventListener("resize", update);
    // }, []);

    // 触发 Reserve
    const handleReserve = () => {
        if (!checkIn || !checkOut) return;
        onReserve({
            propName,
            checkIn,
            checkOut,
            adults: `${adults}`,
            children: `${children}`,
            nights: `${nights}`,
            total: `${total}`,
            img: thumbnail,
            title,
        });
    };

    useEffect(() => {
        // 打印所有日期的月份
        disabledDates.forEach(date => {
        });
    }, [disabledDates]);

    return (
        <div
            className={clsx(
                "relative rounded-2xl bg-white  p-6 space-y-4",
                showCal ? "" : "shadow-lg",
                showCal ? "" : "border border-gray-200"
            )}
        >

            {/* —— 日期弹窗（inline，非portal） —— */}
            {showCal && (
                <div
                    className="absolute inset-0 z-30"
                    style={{ fontSize: 13 }}
                    onClick={e => e.stopPropagation()}
                >
                    <DateRangePicker
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onChange={(ci, co) => {
                            setCheckIn(ci);
                            setCheckOut(co);
                            if (ci && co) fetchRange(parseISO(ci), parseISO(co));
                            // 注意：只有日期都选中了才关闭，clear 不会关闭
                            if (ci && co) setShowCal(false);
                        }}
                        disabledDates={disabledDates}
                        bookedCheckinSet={bookedCheckinSet}
                        fetchRange={fetchRangeWithCache}
                        onClose={() => setShowCal(false)}
                    />
                </div>
            )}

            {/* —— 价格概要 —— */}
            <p className="text-xl font-semibold">
                {checkIn && checkOut ? (
                    <>
                        ¥{total.toLocaleString()}{" "}
                        <span className="text-sm font-normal">
                            {t("forNights", { count: nights })} 
                        </span>
                    </>
                ) : (
                    t("addDatesForPrices")
                )}
            </p>

            {/* —— 日期选择按钮 —— */}
            <div className="grid grid-cols-2 divide-x rounded-lg border bg-white overflow-hidden mb-2">
                <button
                    className="w-full text-left p-3 hover:bg-gray-50"
                    onClick={() => {
                        setShowCal(true);
                        setShowGuest(false);
                    }}
                >
                    <span className="uppercase text-[10px] tracking-widest font-bold block mb-1">
                        {t("checkIn")}
                    </span>
                    <span className="text-sm">{checkIn || t("addDate")}</span>
                </button>
                <button
                    className="w-full text-left p-3 hover:bg-gray-50"
                    onClick={() => {
                        setShowCal(true);
                        setShowGuest(false);
                    }}
                >
                    <span className="uppercase text-[10px] tracking-widest font-bold block mb-1">
                        {t("checkOut")}
                    </span>
                    <span className="text-sm">{checkOut || t("addDate")}</span>
                </button>
            </div>

            {/* —— Guest 选择 —— */}
            <div className="relative">
                <button
                    className="w-full text-left p-3 rounded-lg border hover:bg-gray-50"
                    onClick={() => {
                        setShowGuest(!showGuest);
                        setShowCal(false);
                    }}
                >
                    <span className="uppercase text-[10px] tracking-widest font-bold block mb-1">
                        {t("guests")}
                    </span>
                    <span className="text-sm">
                        {adults + children} {adults + children > 1 ? t("guestsLabel") : t("guestLabel")}                    </span>
                </button>

                {showGuest && (
                    <div className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-1 w-full bg-white rounded-lg shadow-xl border p-6 space-y-6 -mt-0">
                        {/* adults */}
                        <Row
                            label={t("adults")}
                            sub={t("adultsAge")}
                            count={adults}
                            min={1}
                            onChange={setAdults}
                        />
                        {/* children */}
                        <Row
                            label={t("children")}
                            sub={t("childrenAge")}
                            count={children}
                            min={0}
                            onChange={setChildren}
                        />
                        <button
                            className="mt-2 block w-full py-2 border rounded-lg text-sm"
                            onClick={() => setShowGuest(false)}
                        >
                            {t("close")}
                        </button>
                    </div>
                )}
            </div>

            {/* —— Reserve 按钮 —— */}
            <button
                disabled={capacityExceeded}
                title={capacityExceeded ? t("maxCapacityExceeded") : undefined}
                className={clsx(
                    "w-full h-12 rounded-lg text-white font-semibold transition",
                    capacityExceeded
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black hover:bg-gray-900"
                )}
                onClick={() => {
                    if (!checkIn || !checkOut) {
                        setShowCal(true);
                        setShowGuest(false);
                        return;
                    }
                    if (capacityExceeded) {
                        // 超出容纳，什么也不做
                        return;
                    }
                    handleReserve();
                }}
            >
                {checkIn && checkOut ? t("reserve") : t("checkAvailability")}
            </button>
        </div>
    );
};

/* ——— 小型计数器行组件（Adults / Children）———— */
interface RowProps {
    label: string;
    sub: string;
    count: number;
    min: number;
    onChange: (n: number) => void;
}
const Row: React.FC<RowProps> = ({ label, sub, count, min, onChange }) => (
    <div className="flex items-center justify-between">
        <div>
            <div className="font-semibold text-base">{label}</div>
            <div className="text-xs text-gray-500">{sub}</div>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={() => onChange(Math.max(min, count - 1))}
                className="w-8 h-8 border rounded-full flex items-center justify-center text-lg"
            >
                –
            </button>
            <span className="w-6 text-center">{count}</span>
            <button
                onClick={() => onChange(count + 1)}
                className="w-8 h-8 border rounded-full flex items-center justify-center text-lg"
            >
                +
            </button>
        </div>
    </div>
);