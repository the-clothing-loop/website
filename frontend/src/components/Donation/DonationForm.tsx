import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { FormikContext, useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { Button, Card, CardContent, Grid, Typography } from "@material-ui/core";
import { Alert, CircularProgress } from "@mui/material";
import styles from "./Donation.module.css";
import { paymentInitiate } from "../../util/firebase/payments";

import { makeStyles } from "@material-ui/core";
import theme from "../../util/theme";

const accessToken = {
  stripeApiAccessToken: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
};

const DonationFormContent = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const stripe = useStripe();

  const classes = makeStyles(theme as any)();

  const amountsRecurring = [
    {
      string: "€2.50",
      priceId: "price_1KdEdAKBdXHva7sKwHdv20Iw",
    },
    {
      string: "€5.00",
      priceId: "price_1KdEdvKBdXHva7sKjwXlAoxe",
    },
    {
      string: "€10.00",
      priceId: "price_1KdEeQKBdXHva7sK8x1tPlL7",
    },
  ];
  const amounts = [5, 10, 20, 50, 100];

  const formik = useFormik({
    initialValues: {
      email: "",
      recurring: false,
      amount: 10,
      type: "",
      priceId: "price_1KdEdvKBdXHva7sKjwXlAoxe",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("Please enter your e-mail address")
        .email("Please enter a valid e-mail address"),
      amount: Yup.number()
        .min(1, "Your donation amount must be positive")
        .typeError("You must specify a number as donation amount"),
      type: Yup.string(),
    }),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      setLoading(true);
      setError(null);

      paymentInitiate({
        amount: !values.recurring ? values.amount * 100 : null,
        email: values.email,
        type: values.recurring ? "recurring" : "one-off",
        priceId: values.priceId,
      })
        .then(async (data) => {
          console.log(data);
          if (data && data.sessionId && stripe) {
            return await stripe.redirectToCheckout({
              sessionId: data.sessionId,
            });
          } else {
            const err = "An error occurred during checkout...";
            setError(err);
            setLoading(false);
          }
        })
        .catch((error) => {
          setError(error.message);
          setLoading(false);
        });
    },
  });

  let formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  });
  const amountCheckbox = (amount: number) => (
    <Grid item key={amount} xs={6} sm={4} className={styles.paymentToggle}>
      <input
        id={`donation-amount-${amount}`}
        type="radio"
        name="amount"
        value={amount}
        checked={formik.values.amount === amount}
        onChange={() => {
          formik.setFieldValue("amount", amount);
        }}
      />
      <label htmlFor={`donation-amount-${amount}`}>
        {formatter.format(amount)}
      </label>
    </Grid>
  );

  const recurringAmountCheckbox = (amount: any) => (
    <Grid
      item
      key={amount.priceId}
      xs={12}
      sm={12}
      className={styles.paymentToggle}
    >
      <input
        id={`donation-amount-${amount.priceId}`}
        type="radio"
        name="priceId"
        value={amount.priceId}
        checked={formik.values.priceId === amount.priceId}
        onChange={() => {
          formik.setFieldValue("priceId", amount.priceId);
        }}
      />
      <label htmlFor={`donation-amount-${amount.priceId}`}>
        {amount.string}
      </label>
    </Grid>
  );

  return (
    <Card
      className={styles.card}
      style={{ width: "100%", backgroundColor: "transparent" }}
    >
      <CardContent className={styles.cardContent}>
        {error && <Alert severity="error">{error}</Alert>}

        <FormikContext.Provider value={formik}>
          <form onSubmit={formik.handleSubmit} className={styles.donationForm}>
            <p>How do you want to contribute to The Clothing Loop?</p>
            <Grid container className={styles.paymentSelectionOptions}>
              <Grid
                item
                key="one-off"
                xs={12}
                sm={6}
                className={styles.paymentToggle}
              >
                <input
                  id="one-off-donation-button"
                  type="radio"
                  name="type"
                  value="one-off"
                  checked={!formik.values.recurring}
                  onChange={() => {
                    formik.setFieldValue("recurring", false);
                  }}
                />
                <label htmlFor="one-off-donation-button">
                  One-time donation
                </label>
              </Grid>

              <Grid
                item
                key="periodic"
                xs={12}
                sm={6}
                className={styles.paymentToggle}
              >
                <input
                  id="periodic-donation-button"
                  type="radio"
                  name="type"
                  value="periodic"
                  checked={formik.values.recurring}
                  onChange={() => {
                    formik.setFieldValue("recurring", true);
                  }}
                />
                <label htmlFor="periodic-donation-button">
                  Become a member
                </label>
              </Grid>
            </Grid>
            <br />
            {formik.values.recurring ? (
              <p>I will support The Clothing Loop with a monthly donation:</p>
            ) : (
              <p>I will support The Clothing Loop with a one-time donation:</p>
            )}

            <Grid
              container
              spacing={2}
              className={styles.paymentSelectionOptions}
            >
              {formik.values.recurring
                ? amountsRecurring.map((amount: any) =>
                    recurringAmountCheckbox(amount)
                  )
                : amounts.map((amount: number) => amountCheckbox(amount))}
              {!formik.values.recurring && (
                <Grid
                  item
                  key="custom"
                  xs={6}
                  sm={4}
                  className={styles.paymentToggle}
                >
                  <input
                    name="customAmount"
                    type="text"
                    onChange={(e) =>
                      formik.setFieldValue("amount", parseInt(e.target.value))
                    }
                    placeholder="Other amount"
                  />
                </Grid>
              )}
              {formik.errors.amount && (
                <Alert severity="error">{formik.errors.amount}</Alert>
              )}
            </Grid>
            <Grid container spacing={2} className={styles.paymentEmail}>
              <Grid item xs={12}>
                <input
                  name="email"
                  type="text"
                  value={formik.values.email}
                  onChange={(e) =>
                    formik.setFieldValue("email", e.target.value)
                  }
                  placeholder="Email"
                />
                {formik.errors.email && (
                  <Alert severity="error">{formik.errors.email}</Alert>
                )}
              </Grid>
            </Grid>

            <br />

            {formik.values.recurring && (
              <small style={{ color: "#555" }}>
                Don't have a credit card? Choose 'SEPA Direct Debit' in the next
                step.
              </small>
            )}

            <Grid
              container
              className={styles.paymentOptions}
              spacing={2}
              justifyContent="center"
            >
              {loading ? (
                <div style={{ minHeight: "80px" }}>
                  <br style={{ clear: "both" }} />
                  <CircularProgress />
                </div>
              ) : (
                <Grid item xs={12} md={6}>
                  <Button type="submit" className={styles.paymentButton}>
                    Donate
                  </Button>
                </Grid>
              )}
            </Grid>

            <small className={styles.privacyPolicy}>
              By donating you agree with our{" "}
              <a href="/privacy-policy" target="_blank">
                Privacy Policy
              </a>
              .
            </small>
          </form>
        </FormikContext.Provider>
      </CardContent>
    </Card>
  );
};

const DonationForm = () => {
  if (accessToken.stripeApiAccessToken) {
    const stripePublicKey = accessToken.stripeApiAccessToken;

    const stripePromise = loadStripe(stripePublicKey);

    return (
      <div className={styles.donationsWrapper}>
        <h3 className={styles.pageTitle}>Donate to The Clothing Loop</h3>
        <p>
          Thanks for considering a donation to The Clothing Loop! <br />
          With your gift we will work effortlessly to make The Clothing Loop
          even better, bigger and more impactful.
        </p>

        <Elements stripe={stripePromise}>
          <DonationFormContent />
        </Elements>
      </div>
    );
  }
  return <div>Access token not configured</div>;
};

export default DonationForm;
