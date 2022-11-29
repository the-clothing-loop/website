import { Trans, useTranslation } from "react-i18next";

export default function FormActions() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">
            {t("subscribeToTheClothingLoopNewsletter")}
          </span>
          <input
            type="checkbox"
            className="checkbox border-black"
            name="newsletter"
          />
        </label>
      </div>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">
            <Trans
              i18nKey="iAmNotAMinor<1>Tos</1>And<2>PrivacyPolicy</2>Star"
              components={{
                "1": (
                  <a href="/terms-of-use" target="_blank" className="link"></a>
                ),
                "2": (
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="link"
                  ></a>
                ),
              }}
            ></Trans>
          </span>
          <input
            type="checkbox"
            required
            className="checkbox border-black"
            name="privacyPolicy"
          />
        </label>
      </div>
    </div>
  );
}
