import { BaseApiClient } from '@/lib/api';

interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  appOrderId?: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

class PaymentService extends BaseApiClient {
  async createRazorpayOrder(amount: number): Promise<CreateOrderResponse> {
    return this.post<CreateOrderResponse>('payment/create-order', {
      amount,
      currency: 'INR',
    });
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    return this.post<VerifyPaymentResponse>('payment/verify-payment', payload);
  }
}

export const paymentService = new PaymentService();

/**
 * Dynamically loads the Razorpay checkout.js script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}