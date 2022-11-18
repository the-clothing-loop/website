import { Trans, useTranslation } from "react-i18next";

export default function FormActions() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="tw-form-control">
        <label className="tw-label cursor-pointer">
          <span className="tw-label-text">
            {t("subscribeToTheClothingLoopNewsletter")}
          </span>
          <input type="checkbox" className="tw-checkbox" name="newsletter" />
        </label>
      </div>
      <div className="tw-form-control">
        <label className="tw-label cursor-pointer">
          <span className="tw-label-text">
            <Trans
              i18nKey="iAmNotAMinor<1>Tos</1>And<2>PrivacyPolicy</2>Star"
              components={{
                "1": (
                  <a
                    href="/terms-of-use"
                    target="_blank"
                    className="tw-link"
                  ></a>
                ),
                "2": (
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="tw-link"
                  ></a>
                ),
              }}
            ></Trans>
          </span>
          <input type="checkbox" className="tw-checkbox" name="privacyPolicy" />
        </label>
      </div>
    </div>
  );
}
