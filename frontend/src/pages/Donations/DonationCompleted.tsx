import { TwoColumnLayout } from "../../components/Layouts";
import { useTranslation } from "react-i18next";

export default function DonationCompleted() {
  const { t } = useTranslation();
  return (
    <div className="py-16">
      <TwoColumnLayout
        children={
          <div className="p-8">
            <h1 className="text-3xl text-secondary pb-4">{t("thankYou")}</h1>
            <p className="leading-7">
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
