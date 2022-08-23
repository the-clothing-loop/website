import PartyImg from "../../images/party-image.jpg";
import styles from "./Donation.module.css";

import { TwoColumnLayout } from "../Layouts";
import { useTranslation } from "react-i18next";

const Content = () => {
  const {t} = useTranslation();

  return (
    <div className={styles.confirmationMessage}>
      <h3 className={styles.pageTitle}>{t("thankYou")}</h3>
      <p>
        {t("youAretheSpecialTypeOfPersonThatLiftsPeopleUp")}
      </p>
    </div>
  );
};

const DonationCompleted = () => {
  return (
    <div className={styles.donationConfirmationContent}>
      <TwoColumnLayout children={<Content />} img={PartyImg} />;
    </div>
  );
};

export default DonationCompleted;
