import { TwoColumnLayout } from "../../components/Layouts";
import { useTranslation } from "react-i18next";

export default function DonationCompleted() {
  const { t } = useTranslation();
  return (
    <div className="py-16">
      <TwoColumnLayout
        t={t}
        img="https://images.clothingloop.org/x600/party_image.jpg"
        alt="A pink bag with the number nine duck-taped to the side, surrounded by balloons, flags, lint and candles"
      >
        <div className="p-8">
          <h1 className="text-3xl text-secondary pb-4">{t("thankYou")}</h1>
          <p className="leading-7">
            {t("youAretheSpecialTypeOfPersonThatLiftsPeopleUp")}
          </p>
        </div>
      </TwoColumnLayout>
    </div>
  );
}
