import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
import { IUser } from "../../types";

const functions = firebase
  .app()
  .functions(process.env.REACT_APP_FIREBASE_REGION);

if (process.env.REACT_APP_USE_EMULATOR === "true") {
  functions.useEmulator("localhost", 5001);
}

export interface IPaymentInitiateData {
  amount: number | null;
  email: string;
  type: string;
  priceId: string;
}

export interface IPaymentReturnData {
  sessionId: string;
}

export const paymentInitiate = async (
  variables: IPaymentInitiateData
): Promise<IPaymentReturnData> => {
  return (
    await functions.httpsCallable("paymentInitiate")({
      variables,
    })
  ).data as IPaymentReturnData;
};
