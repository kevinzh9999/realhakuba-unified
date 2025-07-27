import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { forwardRef, useImperativeHandle } from "react";
import type { PaymentIntent } from "@stripe/stripe-js";

interface ConfirmPaymentOptions {
  isDelayed: boolean;
  stripeCustomerId?: string;
}

interface ConfirmPaymentResult {
  success: boolean;
  error?: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  paymentIntent?: PaymentIntent;
}

interface StripePaymentFormProps {
  clientSecret: string;
}

const StripePaymentForm = forwardRef<any, StripePaymentFormProps>(
  ({ clientSecret }, ref) => {
    const stripe = useStripe();
    const elements = useElements();

    useImperativeHandle(ref, () => ({
      async confirmPayment(options: ConfirmPaymentOptions): Promise<ConfirmPaymentResult> {
        if (!stripe || !elements) {
          return { success: false, error: "Stripe not loaded" };
        }

        const { isDelayed, stripeCustomerId } = options;

        if (isDelayed) {
          // ✳️ 先提交表单：确保 Stripe Elements 验证通过（新增要求）
          await elements.submit();
          const result = await stripe.confirmSetup({
            elements,
            clientSecret,
            confirmParams: {
            },
            redirect: "if_required",
          });

          if (result.error) {
            return { success: false, error: result.error.message };
          }

          return {
            success: true,
            stripeCustomerId,
            stripePaymentMethodId:
              typeof result.setupIntent.payment_method === "string"
                ? result.setupIntent.payment_method
                : result.setupIntent.payment_method?.id ?? undefined,
            paymentIntent: undefined,
          };
        } else {
          if (!clientSecret) {
            return { success: false, error: "Missing clientSecret" };
          }

          await elements.submit();

          const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
            },
            clientSecret,
            redirect: "if_required",
          });

          if (result.error) {
            return { success: false, error: result.error.message };
          }

          const paymentIntent = result.paymentIntent as PaymentIntent;

          return {
            success: true,
            stripeCustomerId,
            stripePaymentMethodId:
              typeof paymentIntent.payment_method === "string"
                ? paymentIntent.payment_method
                : paymentIntent.payment_method?.id ?? undefined,
            paymentIntent,
          };
        }
      },
    }));

    return <PaymentElement />;
  }
);

export default StripePaymentForm;