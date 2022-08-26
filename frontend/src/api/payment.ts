import axios from "./axios";

interface PaymentInitiateBody {
  amount: number | null;
  email: string;
  type: "recurring" | "one-off";
  price_id: string;
}

interface PaymentInitiateResponse {
  session_id: string;
}

// TODO: add end point in server
export function paymentInitiate(body: PaymentInitiateBody) {
  return axios.post<PaymentInitiateResponse>("/v2/payment/initiate", body);
}
