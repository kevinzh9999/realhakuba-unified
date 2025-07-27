"use client";

import {
  useEffect,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "./stripe-payment-form";
import dayjs from "dayjs";
import { useLocale } from "next-intl";

interface StripeWrapperProps {
  amount: number;
  guestName: string;
  guestEmail: string;
  isDelayed: boolean;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const StripeWrapper = forwardRef<any, StripeWrapperProps>(
  ({ amount, guestName, guestEmail, isDelayed }, ref) => {
    // ✅ 所有 Hooks 都在最顶部调用
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const formRef = useRef<any>(null);
    const rawLocale = useLocale(); // ✅ 移动到这里

    // ✅ 计算派生状态
    const stripeLocale = rawLocale.startsWith("ja") ? "ja" : "en";

    useEffect(() => {
      const init = async () => {
        // Step 1: Create Stripe Customer
        const customerRes = await fetch("/api/stripe/createcustomer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestName, guestEmail }),
        });
        const customerData = await customerRes.json();
        const customerId = customerData.customerId;
        setCustomerId(customerId);

        // Step 2: Create SetupIntent or PaymentIntent
        const endpoint = isDelayed
          ? "/api/stripe/setupintent"
          : "/api/stripe/createpaymentintent";

        const intentRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestName,
            guestEmail,
            totalPrice: amount,
            stripeCustomerId: customerId,
          }),
        });

        const intentData = await intentRes.json();
        setClientSecret(intentData.clientSecret);
      };

      init();
    }, [amount, isDelayed, guestName, guestEmail]);

    useImperativeHandle(ref, () => ({
      async confirmPayment() {
        if (!formRef.current || typeof formRef.current.confirmPayment !== "function") {
          return { success: false, error: "form not ready" };
        }

        // 只执行 Stripe 支付，不再写入 bookings.json
        return await formRef.current.confirmPayment({
          isDelayed,
          stripeCustomerId: customerId,
        });
      },
    }));

    // ✅ 条件渲染放在所有 Hooks 之后
    if (!clientSecret) return <div>Loading payment info...</div>;

    return (
      <Elements stripe={stripePromise} options={{ clientSecret, locale: stripeLocale }} key={clientSecret}>
        <StripePaymentForm ref={formRef} clientSecret={clientSecret} />
      </Elements>
    );
  }
);

export default StripeWrapper;