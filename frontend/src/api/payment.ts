import axios from "./axios";

// TODO: move price ids to config file
export const priceIDs = {
  // priceID not necessary for one off donations
  oneOff_any: "",
  recurring_2_50: "price_1KdEdAKBdXHva7sKwHdv20Iw",
  recurring_5_00: "price_1KdEdvKBdXHva7sKjwXlAoxe",
  recurring_10_00: "price_1KdEeQKBdXHva7sK8x1tPlL7",
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
  return axios.post<PaymentInitiateResponse>("/v2/payment/initiate", body);
}
