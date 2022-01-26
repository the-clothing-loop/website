import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// eslint-disable-next-line @typescript-eslint/no-var-requires,max-len
const stripe = require("stripe")(functions.config().clothingloop.stripeKey);
const endpointSecret = functions.config().clothingloop.webhookSecret;

interface IPaymentInitiateData {
  variables: {
    amount: number | null;
    email: string;
    type: string;
    priceId: string;
  };
}

const payments = {
  initiate: async (
    data: IPaymentInitiateData
  ): Promise<{ sessionId: string }> => {
    functions.logger.debug("paymentInitiate parameters", data);
    const { amount, email, type, priceId } = data.variables;

    let options: any = {
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
      success_url:
        functions.config().clothingloop.base_domain + "/donate/thankyou",
      cancel_url:
        functions.config().clothingloop.base_domain + "/donate/cancel",
    };

    if (type === "recurring") {
      options = {
        payment_method_types: ["sepa_debit", "card"],
        mode: "setup",
        success_url:
          functions.config().clothingloop.base_domain + "/donate/thankyou",
        cancel_url:
          functions.config().clothingloop.base_domain + "/donate/cancel",
        metadata: {
          price_id: priceId,
        },
      };
    }

    functions.logger.debug(options);
    if (email && email !== "") {
      options.customer_email = email;
    }

    const session = await stripe.checkout.sessions
      .create(options)
      .catch((error: { type: string; message: string }) => {
        functions.logger.warn(
          `Error from Stripe: ${error.type}: ${error.message}`
        );
        throw new functions.https.HttpsError(
          "unknown",
          "Something went wrong when processing your checkout request..."
        );
      });

    if (!session || !session.id) {
      throw new functions.https.HttpsError(
        "unknown",
        "Something went wrong when processing your checkout request..."
      );
    }
    await admin
      .firestore()
      .collection("payments")
      .doc(session.id)
      .set({
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
  webhook: async (
    request: functions.Request,
    response: functions.Response
  ): Promise<any> => {
    functions.logger.debug("payment webhook parameters", request.body);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const payload = request.rawBody;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      functions.logger.warn(`Stripe Webhook Error: ${err.message}`);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.mode === "setup") {
        const priceId = session.metadata.price_id;

        const setupIntentID = session.setup_intent;
        const intent = await stripe.setupIntents.retrieve(setupIntentID);

        const method = await stripe.paymentMethods.retrieve(
          intent.payment_method
        );
        const billingDetails = method.billing_details;

        const email = billingDetails.email;

        /* Create customer */
        const customer = await stripe.customers.create({
          email,
          name: billingDetails.name,
          address: billingDetails.address,
          payment_method: intent.payment_method,
          invoice_settings: {
            default_payment_method: intent.payment_method,
          },
        });

        const customerId = customer.id;
        await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
        });
        await admin.firestore().collection("payments").doc(session.id).update({
          sessionId: session.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          completed: true,
          email,
          customerId,
        });

        // await sendThankYouEmail(email);

        // const amount = {
        //   "price_1IAgywKEl0DmQOIqsyiOEF88": "2,50",
        //   "price_1IAgzIKEl0DmQOIqLGl1nBIA": "5,00",
        //   "price_1IAgzbKEl0DmQOIqEuVJitsi": "10,00",
        // }[priceId];
        // await postSlackUpdateMember(amount);
      } else {
        if (!session.customer) {
          return response
            .status(400)
            .send("Webhook Error: No customer provided...");
        }

        const customer = await stripe.customers
          .retrieve(session.customer)
          .catch(() => {
            return response.status(400).send("Customer not found...");
          });

        const email = customer.email;

        await admin.firestore().collection("payments").doc(session.id).update({
          sessionId: session.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          completed: true,
          email,
          customerId: session.customer,
        });

        // await sendThankYouEmail(email);

        // const amount = session.amount_total / 100;
        // await postSlackUpdateDonation(amount);
      }

      return response.json({ received: true });
    } else {
      return response.json({ received: true });
    }
  },
};

export default payments;
