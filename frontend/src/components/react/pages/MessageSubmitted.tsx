import { useTranslation } from "react-i18next";
import useLocalizePath from "../util/localize_path.hooks";

export default function MessageSubmitted() {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  return (
    <main className="container px-1 md:px-20 pt-10 mx-auto">
      <h1 className="font-serif font-bold text-secondary text-6xl mb-6">
        {t("thankYouForYourMessage")}
      </h1>
      <p className="mb-6">{t("weWillReplySoon")}</p>
      <div className="flex flex-row">
        <a className="btn btn-secondary btn-outline" href={localizePath("/")}>
          {t("home")}
        </a>
        <a className="btn btn-primary ml-4" href={localizePath("/faq")}>
          {t("faq")}
        </a>
      </div>
    </main>
  );
}
