import { TwoColumnLayout } from "../../components/Layouts";
import { useTranslation } from "react-i18next";

export default function DonationCompleted() {
  const { t } = useTranslation();
  return (
    <div className="py-16">
      <TwoColumnLayout
        t={t}
        img="https://ucarecdn.com/1145cf2e-d731-4e0c-8644-fa117c2ccc6c/-/resize/x600/-/format/auto/-/quality/smart/partyimage.jpg"
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
