"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const runtime = "edge";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, Suspense } from "react";
import { createPortal } from "react-dom";
import { IoAlertCircle } from "react-icons/io5";

// 使用新的动画组件
import { LoadingOverlay } from './_components/loading-overlay';
import { CelebrateAnimation } from './_components/celebrate-animation';

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";
import dayjs from "dayjs";

import StripeWrapper from "./_components/stripe-wrapper";
import FloatingInput from "./_components/floating-input";

function StepCard({
  title,
  active,
  onClick,
  completed,
  canExpand,
  children,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  completed: boolean;
  canExpand: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl transition-all",
        active
          ? "shadow-lg border border-gray-300 bg-white"
          : "border border-gray-200 bg-white"
      )}
      style={{ overflow: "hidden", cursor: canExpand ? "pointer" : "not-allowed" }}
      onClick={onClick}
      tabIndex={0}
    >
      <div className={clsx("flex items-center px-6 py-4", active ? "font-semibold" : "font-semibold text-black")}>
        <span>{title}</span>
      </div>
      {active && <div className="px-6 pb-5" onClick={e => e.stopPropagation()}>{children}</div>}
    </div>
  );
}

export default function ReservationPage() {
  const t = useTranslations("ReservationApp.ReservationPage");
  const router = useRouter();
  const params = useSearchParams();
  const propName = params.get("propName");
  const propUrl = `${process.env.NEXT_PUBLIC_PROP_URL}/${propName}`;
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");
  const nightsRaw = params.get("nights");
  const nights = Math.max(1, nightsRaw ? Number(nightsRaw) : 1);
  const adults = params.get("adults");
  const children = params.get("children");
  const total = params.get("total");
  const pricePerNight = Number(total) / Number(nights);
  const title = params.get("title") || "Null";
  const guestText =
    t("adultLabel", { count: adults || 1 }) +
    (children && Number(children) > 0
      ? `, ${t("childLabel", { count: children })}`
      : "");
  const img = params.get("img");
  const imgUrl = `${propUrl}/images/${img}`;

  // summary cancel policy
  const today = dayjs();
  const checkInDate = checkIn ? dayjs(checkIn) : null;
  const cancelDate = checkInDate
    ? checkInDate.subtract(30, "day").format("YYYY-MM-DD")
    : "";

  let firstLine = "", secondLine = "";
  if (checkInDate) {
    const diffDays = checkInDate.diff(today, "day");
    if (diffDays < 30) {
      firstLine = t("nonRefundable");
      secondLine = t("checkInSoon");
    } else {
      firstLine = t("freeCancel");
      secondLine = t("cancelBefore", { date: cancelDate });
    }
  }

  const [step, setStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "" });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ orderId: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const guestInfoFilled = !!guestInfo.name && isValidEmail(guestInfo.email);

  const canStep2 = guestInfoFilled;
  const canStep3 = guestInfoFilled;

  const stripeRef = useRef<any>(null);

  const isDelayed = checkIn ? dayjs(checkIn).diff(dayjs(), "day") >= 30 : false;
  const chargeDate = isDelayed ? cancelDate : dayjs().format("YYYY-MM-DD");

  async function handleMakePayment() {
    setIsProcessing(true);
    
    try {
      // 1. Stripe
      const paymentResult = await stripeRef.current.confirmPayment({
        isDelayed: false,
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        totalPrice: Number(total),
      });

      setStep(0);

      if (!paymentResult.success) {
        setPaymentMessage(t("paymentFailure", { error: paymentResult.error }));
        setIsProcessing(false);
        return;
      }

      // 2. Beds24
      const bookingData = {
        propName,
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        checkIn,
        checkOut,
        adults,
        children,
        total,
        message,
      };

      let bookId: string | null = null;

      try {
        const res = await fetch("/api/beds24/createbooking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        });

        const data = await res.json();

        if (!data.ok) {
          setPaymentMessage(t("orderFailure", { error: data.error }));
          setIsProcessing(false);
          return;
        }

        bookId = data.data.bookId.toString();
      } catch (e) {
        setPaymentMessage(t("beds24Error", { error: e instanceof Error ? e.message : String(e) }));
        setIsProcessing(false);
        return;
      }

      // 3. bookings.json
      const storeRes = await fetch("/api/storebooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propName: propName,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          checkIn,
          checkOut,
          totalPrice: Number(total),
          status: "request",
          stripePaymentMethodId: paymentResult.stripePaymentMethodId,
          stripeCustomerId: paymentResult.stripeCustomerId,
          paymentIntentId: null,
          beds24BookId: bookId,
          chargeDate,
          approved_for_charge: false,
          manual_review_status: "pending",
          charge_method: isDelayed ? "scheduled" : "immediate",
        }),
      });

      const storeData = await storeRes.json();
      if (!storeRes.ok) {
        setPaymentMessage(t("storageError", { error: storeData.error }));
        setIsProcessing(false);
        return;
      }

      // 4. show ID
      setIsProcessing(false);
      setPaymentMessage(null);
      setSuccessData({ orderId: bookId! });
    } catch (error) {
      setIsProcessing(false);
      setPaymentMessage(t("unexpectedError"));
    }
  }

  return (
    <Suspense>
      {/* 使用新的加载动画组件 */}
      <LoadingOverlay isOpen={isProcessing} />

      {/* Price breakdown 弹窗 */}
      {showBreakdown &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowBreakdown(false)}
          >
            <div
              className="bg-white rounded-xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">{t("priceBreakdown")}</h2>
              <div className="flex justify-between text-sm">
                <span>
                  ¥{pricePerNight.toLocaleString()} × {nights} {t("pricePerNightLabel", { count: nights })}
                </span>
                <span>¥{(pricePerNight * Number(nights)).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 my-4" />
              <div className="flex justify-between font-semibold">
                <span>{t("totalLabel")}</span>
                <span>¥{Number(total).toLocaleString()}</span>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowBreakdown(false)}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 成功下单后弹窗 - 使用新的成功动画组件 */}
      {successData &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
            <AnimatePresence>
              <motion.div
                key="successDrawer"
                initial={{ 
                  y: typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : "100%", 
                  scale: typeof window !== 'undefined' && window.innerWidth >= 768 ? 0.95 : 1,
                  opacity: 0 
                }}
                animate={{ 
                  y: 0, 
                  scale: 1,
                  opacity: 1
                }}
                exit={{ 
                  y: typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : "100%",
                  scale: typeof window !== 'undefined' && window.innerWidth >= 768 ? 0.95 : 1,
                  opacity: 0 
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  opacity: { duration: 0.2 }
                }}
                className={`
                  bg-white shadow-lg w-full overflow-y-auto scrollbar-hide hide-scrollbar p-6 pt-3
                  rounded-t-2xl max-w-full
                  md:rounded-2xl md:max-w-md md:max-h-[90vh]
                `}
                style={{ 
                  maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? "calc(100dvh - 40px)" : undefined,
                  marginTop: typeof window !== 'undefined' && window.innerWidth < 768 ? "30px" : undefined
                }}
              >
                {/* 使用新的成功动画组件 */}
                <CelebrateAnimation />

                <h2 className="text-center text-2xl font-bold mt-4">{t("bookingRequestSubmitted")}</h2>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-center text-sm text-blue-800 whitespace-pre-line">
                    {t("bookingRequestPending")}
                  </p>
                </div>

                <p className="text-center text-base text-gray-500 mt-4">
                  {t("yourRequestId")}:{" "}
                  <span className="text-gray-800 font-medium">{successData.orderId}</span>
                </p>

                {/* Summary Card */}
                <div className="mt-6 rounded-2xl border border-gray-200 p-6 bg-white">
                  {/* 1. 小图 + 标题 */}
                  <div className="mb-3 flex gap-4 items-center">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-gray-100">
                      <Image src={imgUrl} alt={title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{title}</h3>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 my-4" />

                  {/* 2. Guest info */}
                  <div className="mb-4">
                    <div className="font-semibold text-sm mb-2">{t("guestInfo")}</div>
                    <div className="text-sm text-gray-500 flex flex-col gap-1">
                      <span>{guestInfo.name}</span>
                      <span>{guestInfo.email}</span>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 my-4" />

                  {/* 3. Trip details */}
                  <div className="mb-4">
                    <div className="font-semibold text-sm mb-2">{t("tripDetails")}</div>
                    <div className="text-sm text-gray-500 flex flex-col gap-1">
                      <span>{checkIn} – {checkOut}</span>
                      <span>{guestText}</span>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 my-4" />

                  {/* 4. Cancellation policy */}
                  <div className="mb-4">
                    <div className="font-semibold text-sm mb-2">{t("cancelPolicy")}</div>
                    <div className="text-sm text-gray-500">
                      {isDelayed
                        ? t("freeCancelBefore", { date: cancelDate })
                        : t("nonRefundable")}
                    </div>
                  </div>
                  <div className="border-b border-gray-200 my-4" />

                  {/* 5. Price details */}
                  <div className="mb-4">
                    <div className="font-semibold text-sm mb-2">{t("priceDetails")}</div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        ¥{pricePerNight.toLocaleString()} x {nights} {t("pricePerNightLabel", { count: nights })}
                      </span>
                      <span>¥{(pricePerNight * Number(nights)).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 my-4" />

                  {/* 6. Payment details */}
                  <div className="mb-2">
                    <div className="font-semibold text-sm mb-2">{t("paymentInfo")}</div>

                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{t("paymentMethodSaved")}</span>
                      </div>

                      {isDelayed ? (
                        <div className="mt-2 p-3 bg-amber-50 rounded-lg">
                          <p className="text-xs text-amber-800">
                            {t("delayedPaymentNotice", {
                              amount: `¥${Number(total).toLocaleString()}`,
                              date: chargeDate
                            })}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-800">
                            {t("immediatePaymentNotice", {
                              amount: `¥${Number(total).toLocaleString()}`
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">{t("importantNote")}:</span> {t("bookingConfirmationNote")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setSuccessData(null);
                      router.back();
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    {t("close")}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    {t("printRequest")}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}

      {/* 失败/信息弹窗 */}
      {paymentMessage && !successData &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPaymentMessage(null)}>
            <div
              className={clsx("bg-white rounded-2xl p-6 max-w-xs text-center", "border shadow-lg border-gray-300")}
              onClick={e => e.stopPropagation()}
            >
              <p className="mb-4">{paymentMessage}</p>
              <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={() => setPaymentMessage(null)}>
                {t("close")}
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 页面主体内容保持不变 */}
      <div className="bg-white min-h-screen pt-0 pb-12">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 mt-2">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

            {/* 左栏 Summary Card */}
            <div className="w-full max-w-[80vw] md:max-w-[360px] mx-auto md:mx-0 md:w-[360px] md:sticky md:top-[90px] self-start">
              <div className="h-[90px] flex items-center">
                <Link
                  href={propUrl || "/"}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-200 rounded-full px-2 py-2 transition font-medium text-gray-700"
                  aria-label={t("back")}
                >
                  <ArrowLeft size={25} strokeWidth={2.1} />
                </Link>
                <h1 className="text-2xl font-semibold ml-6 md:hidden">{t("confirmAndPay")}</h1>
              </div>
              <div className="rounded-xl border border-gray-200 p-6 bg-white w-full">
                {/* 内容保持不变 */}
                <div className="mb-3">
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-gray-100">
                      <Image src={imgUrl} alt={title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base truncate">{title}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-900 font-medium">{firstLine}</div>
                    <div className="text-sm text-gray-500 mt-1">{secondLine}</div>
                  </div>
                </div>
                <div className="border-b border-gray-200 my-4" />

                <div className="mb-4">
                  <div className="font-semibold text-sm mb-2">{t("tripDetails")}</div>
                  <div className="text-sm text-gray-500 flex flex-col gap-1">
                    <span>{checkIn} – {checkOut}</span>
                    <span>{guestText}</span>
                  </div>
                </div>
                <div className="border-b border-gray-200 my-4" />

                <div className="mb-4">
                  <div className="font-semibold text-sm mb-2">{t("priceDetails")}</div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      ¥{pricePerNight.toLocaleString()} x {nights} {t("pricePerNightLabel", { count: nights })}
                    </span>
                    <span>¥{(pricePerNight * Number(nights)).toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-b border-gray-200 my-4" />

                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-base">{t("totalLabel")}</span>
                  <span className="font-semibold text-base">¥{Number(total).toLocaleString()}</span>
                </div>
                <button className="text-xs text-gray-600 underline hover:text-black" onClick={() => setShowBreakdown(true)}>
                  {t("priceBreakdown")}
                </button>
              </div>
            </div>

            {/* 右栏步骤 */}
            <div className="w-full max-w-[80vw] md:max-w-[420px] mx-auto md:mx-0 flex flex-col">
              <div className="h-[90px] flex items-center hidden md:flex">
                <h1 className="text-3xl font-semibold" style={{ lineHeight: 1.1 }}>
                  {t("confirmAndPay")}
                </h1>
              </div>

              <div className="flex flex-col gap-6">
                <StepCard
                  title={`1. ${t("guestInfo")}`}
                  active={step === 1}
                  onClick={() => setStep(1)}
                  completed={guestInfoFilled}
                  canExpand={step === 1 || step > 1}
                >
                  <FloatingInput
                    label={t("fullName")}
                    value={guestInfo.name}
                    onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  />
                  <FloatingInput
                    label={t("email")}
                    type="email"
                    value={guestInfo.email}
                    onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  />

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-red-500 mr-4">
                      {!isValidEmail(guestInfo.email) && guestInfo.email && (
                        <div className="flex items-center text-sm text-[#B91C1C] font-medium space-x-1 ml-1">
                          <IoAlertCircle size={16} className="flex-shrink-0" />
                          <span>{t("invalidEmail")}</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="bg-black text-white rounded-lg py-3 px-8 font-semibold disabled:opacity-60"
                      disabled={!guestInfoFilled}
                      onClick={() => setStep(2)}
                    >
                      {t("next")}
                    </button>
                  </div>
                </StepCard>

                <StepCard
                  title={`2. ${t("messageToUs")}`}
                  active={step === 2}
                  onClick={() => canStep2 && setStep(2)}
                  completed={true}
                  canExpand={canStep2}
                >
                  <textarea
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition"
                    placeholder={t("optionalMessage")}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      className="bg-black text-white rounded-lg py-3 px-8 font-semibold"
                      onClick={() => setStep(3)}
                    >
                      {t("next")}
                    </button>
                  </div>
                </StepCard>

                <StepCard
                  title={`3. ${t("submitRequest")}`}
                  active={step === 3}
                  onClick={() => canStep3 && setStep(3)}
                  completed={false}
                  canExpand={canStep3}
                >
                  <StripeWrapper
                    ref={stripeRef}
                    amount={Number(total)}
                    guestName={guestInfo.name}
                    guestEmail={guestInfo.email}
                    isDelayed={isDelayed}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      {isDelayed ? (
                        <div>
                          <div>{t("notChargedUntil")}</div>
                          <div className="font-medium">{chargeDate}</div>
                        </div>
                      ) : (
                        <div>&nbsp;</div>
                      )}
                    </div>
                    <button
                      className="bg-black text-white rounded-lg py-3 px-8 font-semibold disabled:opacity-60"
                      disabled={!canStep3}
                      onClick={handleMakePayment}
                    >
                      {t("requestToBook")}
                    </button>
                  </div>
                </StepCard>

              </div>
            </div>

          </div>
        </div>
      </div>
    </Suspense>
  );
}