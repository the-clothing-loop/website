import axios from "./axios";

export const priceIDs = {
  oneOff_any: "price_1Lc6cAJnVkskaoubR7eod7bZ",
  recurring_2_50: "price_1Lc5s1JnVkskaoubc0Sz2AH3",
  recurring_5_00: "price_1Lc5s1JnVkskaoubQMElHikE",
  recurring_10_00: "price_1Lc5s1JnVkskaoubMk6VPlMq",
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

// TODO: add end point in server
export function paymentInitiate(body: PaymentInitiateBody) {
  return axios.post<PaymentInitiateResponse>("/v1/payment/initiate", body);
}
