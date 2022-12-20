import axios from "./axios";

export const priceIDs = {
  // priceID not necessary for one off donations
  oneOff_any: "",
  recurring_2_50: import.meta.env.VITE_STRIPE_PRICE_RECURRING_2_50 || "",
  recurring_5_00: import.meta.env.VITE_STRIPE_PRICE_RECURRING_5_00 || "",
  recurring_10_00: import.meta.env.VITE_STRIPE_PRICE_RECURRING_10_00 || "",
};

interface PaymentInitiateBody {
  // only required on one-off payments
  // value is in euro cents
  price_cents: number | null;
  email: string;
  is_recurring: boolean;
  price_id: string;
}

interface PaymentInitiateResponse {
  session_id: string;
}

export function paymentInitiate(body: PaymentInitiateBody) {
  return axios.post<PaymentInitiateResponse>("/v2/payment/initiate", body);
}
