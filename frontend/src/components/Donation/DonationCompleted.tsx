import PartyImg from "../../images/party-image.jpg";
import styles from "./Donation.module.css";

import { TwoColumnLayout } from "../Layouts";

const Content = () => {
  return (
    <div className={styles.confirmationMessage}>
      <h3 className={styles.pageTitle}>Thank you!</h3>
      <p>
        You are the special type of person that lifts people up, and makes the
        world a better place. Rest assured that every donation has us doing a
        little dance in our (home) office. We've got a lot of work ahead of us,
        and your donation has made it that much easier to get things done and
        thrust us forward towards a more sustainable world. Thank you so much
        for your desire to help The Clothing Loop succeed.
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
