import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { FormikContext, useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import {
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import styles from "./Donation.module.css";

import theme from "../../util/theme";
import { useTranslation } from "react-i18next";
import { paymentInitiate, priceIDs } from "../../api/payment";

interface RecurringAmount {
  text: string;
  priceID: string;
}

interface FormValues {
  email: string;
  isRecurring: boolean;
  recurringType: RecurringType;
  oneOffAmount: number;
}

enum RecurringType {
  R2_50,
  R5_00,
  R10_00,
}

const recurringAmounts: Record<RecurringType, RecurringAmount> = {
  [RecurringType.R2_50]: {
    text: "€2.50",
    priceID: priceIDs.recurring_2_50,
  },
  [RecurringType.R5_00]: {
    text: "€5.00",
    priceID: priceIDs.recurring_5_00,
  },
  [RecurringType.R10_00]: {
    text: "€10.00",
    priceID: priceIDs.recurring_10_00,
  },
};
const oneOffStandardAmounts = [5, 10, 20, 50, 100];
const oneOffPriceID = priceIDs.oneOff_any;

const DonationFormContent = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const stripe = useStripe();

  const classes = makeStyles(theme as any)();
  const { t } = useTranslation();

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      isRecurring: false,
      recurringType: RecurringType.R5_00,
      oneOffAmount: 10,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required(t("pleaseEnterYourEmail"))
        .email(t("pleaseEnterAValid.emailAddress")),
      amount: Yup.number()
        .min(1, t("yourDonationAmountMustBePositive"))
        .typeError(t("youMustSpecifyANumberAsDonation")),
      type: Yup.string(),
    }),
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: true,
    onSubmit: (values) => {
      setLoading(true);
      setError(null);

      (async () => {
        try {
          let priceID = oneOffPriceID;
          if (values.isRecurring) {
            priceID = recurringAmounts[values.recurringType].priceID;
          }

          const res = await paymentInitiate({
            price_cents: values.isRecurring ? null : values.oneOffAmount * 100,
            email: values.email,
            is_recurring: values.isRecurring,
            price_id: priceID,
          });

          console.log(res.data);
          if (!res.data?.session_id) throw "couldn't find session ID";
          if (!stripe) throw "stripe object does not exist";
          const err = (
            await stripe.redirectToCheckout({
              sessionId: res.data.session_id,
            })
          ).error;
          if (err) throw err;
        } catch (e: any) {
          console.error(e);
          setError(e?.data || t("anErrorOccurredDuringCheckout"));
          setLoading(false);
          setTimeout(() => {
            setError("");
          }, 3000);
        }
      })();
    },
  });

  let formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  });
  const oneOffCheckbox = (amount: number) => (
    <Grid
      item
      key={amount}
      xs={6}
      sm={4}
      className={styles.paymentToggle}
      classes={{ root: classes.gridItemsNoPadding }}
    >
      <input
        id={`donation-amount-${amount}`}
        type="radio"
        name="amount"
        value={amount}
        checked={formik.values.oneOffAmount === amount}
        onChange={() => {
          formik.setFieldValue("oneOffAmount", amount);
        }}
      />
      <label htmlFor={`donation-amount-${amount}`}>
        {formatter.format(amount)}
      </label>
    </Grid>
  );

  const recurringAmountCheckbox = (recurringType: RecurringType) => {
    let recurringAmount = recurringAmounts[recurringType];
    console.log("change reccuring to ", recurringAmount, recurringType);
    return (
      <Grid
        item
        key={recurringAmount.priceID}
        xs={12}
        sm={12}
        className={styles.paymentToggle}
        classes={{ root: classes.gridItemsNoPadding }}
      >
        <input
          id={`donation-amount-${recurringAmount.priceID}`}
          type="radio"
          name="priceID"
          value={recurringAmount.priceID}
          checked={formik.values.recurringType === recurringType}
          onChange={() => {
            formik.setFieldValue("recurringType", recurringType);
          }}
        />
        <label htmlFor={`donation-amount-${recurringAmount.priceID}`}>
          {recurringAmount.text}
        </label>
      </Grid>
    );
  };

  return (
    <Card
      className={styles.card}
      style={{ width: "100%", backgroundColor: "transparent" }}
    >
      <CardContent className={styles.cardContent}>
        {error && <Alert severity="error">{error}</Alert>}

        <FormikContext.Provider value={formik}>
          <form onSubmit={formik.handleSubmit} className={styles.donationForm}>
            <p>{t("howDoYouWantToContributeToTheClothingLoop")}</p>
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
                  name="recurring"
                  value="one-off"
                  checked={!formik.values.isRecurring}
                  onChange={() => {
                    formik.setFieldValue("isRecurring", false);
                  }}
                />
                <label htmlFor="one-off-donation-button">
                  {t("oneTimeDonation")}
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
                  name="recurring"
                  value="periodic"
                  checked={formik.values.isRecurring}
                  onChange={() => {
                    formik.setFieldValue("isRecurring", true);
                  }}
                />
                <label htmlFor="periodic-donation-button">
                  {t("becomeAMember")}
                </label>
              </Grid>
            </Grid>
            <br />
            {formik.values.isRecurring ? (
              <p>{t("iWillSupportTheClothingLoopWithAMonthlyDonation")}</p>
            ) : (
              <p>{t("iWillSupportTheClothingLoopWithAOneTimeDonation")}</p>
            )}

            <Grid
              container
              spacing={2}
              className={styles.paymentAmountOptions}
              sx={{ display: formik.values.isRecurring ? "none" : undefined }}
            >
              {oneOffStandardAmounts.map((amount) => oneOffCheckbox(amount))}

              <Grid
                item
                key="custom"
                xs={6}
                sm={4}
                className={styles.paymentToggle}
                classes={{ root: classes.gridItemsNoPadding }}
              >
                <input
                  name="customAmount"
                  type="text"
                  onChange={(e) =>
                    formik.setFieldValue("amount", parseInt(e.target.value))
                  }
                  placeholder={t("otherAmount")}
                />
              </Grid>
              {formik.errors.oneOffAmount && (
                <Alert severity="error">{formik.errors.oneOffAmount}</Alert>
              )}
            </Grid>
            <Grid
              container
              spacing={2}
              className={styles.paymentAmountOptions}
              sx={{ display: formik.values.isRecurring ? undefined : "none" }}
            >
              {[
                RecurringType.R2_50,
                RecurringType.R5_00,
                RecurringType.R10_00,
              ].map((i) => recurringAmountCheckbox(i))}
            </Grid>
            <Grid container spacing={2} className={styles.paymentEmail}>
              <Grid item xs={12} classes={{ root: classes.gridItemsNoPadding }}>
                <input
                  name="email"
                  type="text"
                  value={formik.values.email}
                  onChange={(e) =>
                    formik.setFieldValue("email", e.target.value)
                  }
                  placeholder={t("email")}
                />
                {formik.errors.email && (
                  <Alert severity="error">{formik.errors.email}</Alert>
                )}
              </Grid>
            </Grid>

            <br />

            {formik.values.isRecurring && (
              <small style={{ color: "#555" }}>
                {t("dontHaveACreditCardChooseSepa")}
              </small>
            )}

            <Grid
              container
              className={styles.paymentOptions}
              spacing={2}
              justifyContent="center"
            >
              {error && (
                <Alert severity="error" sx={{ marginTop: 4 }}>
                  {error}
                </Alert>
              )}
              {loading ? (
                <div style={{ minHeight: "80px" }}>
                  <br style={{ clear: "both" }} />
                  <CircularProgress />
                </div>
              ) : (
                <Grid
                  item
                  xs={12}
                  md={6}
                  classes={{ root: classes.gridItemsNoPadding }}
                >
                  <Button type="submit" className={styles.paymentButton}>
                    {t("donate")}
                  </Button>
                </Grid>
              )}
            </Grid>

            <small className={styles.privacyPolicy}>
              {t("byDonatingYouAgreeWithOur")}
              <a href="/privacy-policy" target="_blank">
                {t("privacyPolicy")}
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
  const { t } = useTranslation();

  const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "";
  if (stripePublicKey) {
    const stripePromise = loadStripe(stripePublicKey);

    return (
      <div className={styles.donationsWrapper}>
        <h3 className={styles.pageTitle}>{t("donateToTheClothingLoop")}</h3>
        <p
          dangerouslySetInnerHTML={{
            __html: t("thanksForConsideringADonation"),
          }}
        ></p>

        <Elements stripe={stripePromise}>
          <DonationFormContent />
        </Elements>
      </div>
    );
  }
  return <div>{t("accessTokenNotConfigured")}</div>;
};

export default DonationForm;
