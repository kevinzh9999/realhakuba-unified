//stripe-payment-form.tsx
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

        const { stripeCustomerId } = options;
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
      },
    }));
    return <PaymentElement />;
  }
);

export default StripePaymentForm;