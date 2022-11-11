import { TwoColumnLayout } from "../../components/Layouts";
import { useTranslation } from "react-i18next";

export default function DonationCompleted() {
  const { t } = useTranslation();
  return (
    <div className="tw-py-16">
      <TwoColumnLayout
        children={
          <div className="tw-p-8">
            <h1 className="tw-text-3xl tw-text-secondary tw-pb-4">
              {t("thankYou")}
            </h1>
            <p className="tw-leading-7">
              {t("youAretheSpecialTypeOfPersonThatLiftsPeopleUp")}
            </p>
          </div>
        }
        img="/images/party-image.jpg"
      />
      ;
    </div>
  );
}
