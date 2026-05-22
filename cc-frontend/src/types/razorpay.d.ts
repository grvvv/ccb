// Type declarations for the Razorpay Standard Checkout script
// loaded from https://checkout.razorpay.com/v1/checkout.js

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayOrder {
  amount: number
  amount_due: number
  amount_paid: number
  attempts: number
  created_at: number
  currency: string
  entity: 'order'
  id: string
  notes: Record<string, string>
  offer_id: string | null
  receipt: string
  status: 'created' | 'attempted' | 'paid'
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (response: any) => void): void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

export {};