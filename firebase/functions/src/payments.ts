import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// eslint-disable-next-line @typescript-eslint/no-var-requires,max-len
const stripe = require("stripe")("sk_test_51HxZwwKEl0DmQOIqcCvTNnTthmJL6eEnyDDSHAqliBayBW9XALZ2FfJknueL6F0CuUknbaE2sYmSmQ4HXURiNRZv00Kn5pNPk9");

interface IPaymentInitiateData {
  variables: {
    amount: number | null;
    email: string;
    type: string;
    priceId: string;
  }
}

const payments = {
  initiate: async (data : IPaymentInitiateData) => {
    functions.logger.debug("paymentInitiate parameters", data);
    const {amount, email, type, priceId} = data.variables;

    let options : any = {
      payment_method_types: ["ideal", "card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Donation",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: functions.config().clothingloop.base_domain + "/donate/thankyou",
      cancel_url: functions.config().clothingloop.base_domain + "/donate/cancel",
    };

    if (type === "recurring") {
      options = {
        payment_method_types: ["sepa_debit", "card"],
        mode: "setup",
        success_url: functions.config().clothingloop.base_domain + "/donate/thankyou",
        cancel_url: functions.config().clothingloop.base_domain + "/donate/cancel",
        metadata: {
          price_id: priceId,
        },
      };
    }

    functions.logger.debug(options);
    if (email && email !== "") {
      options.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(options).catch((error: { type: string, message: string }) => {
      functions.logger.warn(`Error from Stripe: ${error.type}: ${error.message}`);
      throw new functions.https.HttpsError("unknown", "Something went wrong when processing your checkout request...");
    });

    if (!session || !session.id) {
      throw new functions.https.HttpsError("unknown", "Something went wrong when processing your checkout request...");
    }
    await admin.firestore().collection("payments").add({
      sessionId: session.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      amount,
      email,
      recurring: type === "recurring",
    });

    functions.logger.debug("payment initiate result", session);
    return {
      sessionId: session && session.id,
    };
  },
};

export default payments;
