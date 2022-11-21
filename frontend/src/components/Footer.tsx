import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Newsletter } from "./Newsletter";
import { MouseEvent, useContext, useState } from "react";
import { AuthContext } from "../providers/AuthProvider";

export default function Footer() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const [copying, setCopying] = useState("");

  function copyToClipboard(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    let text = (e.target as any).innerText;

    setCopying(text);
    setTimeout(() => {
      setCopying("");
    }, 3000);

    navigator.clipboard.writeText(text);
  }

  return (
    <footer className="tw-bg-white tw-pt-32 tw-w-full">
      <div className="tw-flex tw-flex-col md:tw-flex-row">
        <div className="tw-w-1/2 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-justify-end tw-p-4">
          <div className="tw-p-4">
            <span className="tw-block tw-text-secondary tw-font-bold tw-text-2xl tw-mb-3">
              {t("learnMore")}
            </span>
            <Link className="tw-block tw-link tw-link-hover tw-mb-1" to="/faq">
              {t("faqs")}
            </Link>
            <Link
              className="tw-block tw-link tw-link-hover tw-mb-1"
              to="/contact-us"
            >
              {t("help")}
            </Link>
            <Link
              className="tw-block tw-link tw-link-hover tw-mb-1"
              to="/about"
            >
              {t("about")}
            </Link>
          </div>
          <div className="tw-p-4">
            <span className="tw-block tw-text-secondary tw-font-bold tw-text-2xl tw-mb-3">
              {t("loops")}
            </span>
            <Link
              className="tw-block tw-link tw-link-hover tw-mb-1"
              to="/loops/find"
            >
              {t("findingALoop")}
            </Link>
            <Link
              className="tw-block tw-link tw-link-hover tw-mb-1"
              to="/loops/new/users/signup"
            >
              {t("startingALoop")}
            </Link>
            {authUser ? (
              <Link
                className="tw-block tw-link tw-link-hover tw-mb-1"
                to="/users/logout"
              >
                {t("logout")}
              </Link>
            ) : (
              <Link
                className="tw-block tw-link tw-link-hover tw-mb-1"
                to="/users/login"
              >
                {t("login")}
              </Link>
            )}
          </div>
          <div className="tw-p-4">
            <span className="tw-block tw-text-secondary tw-font-bold tw-text-2xl tw-mb-3">
              {t("findUs")}
            </span>
            <ul className="">
              <li className="tw-mb-3 tw-flex tw-items-center">
                <a
                  href="https://www.instagram.com/theclothingloop/"
                  target="_blank"
                  className="tw-btn tw-btn-circle tw-btn-outline feather feather-instagram tw-text-lg tw-mr-3 hover:tw-bg-instagram"
                  aria-label="link to our instagram account"
                ></a>
                <a
                  href="#"
                  tabIndex={1}
                  className={`tw-tooltip tw-tooltip-bottom tw-text-sm ${
                    copying === "@theclothingloop" ? "tw-tooltip-open" : ""
                  }`}
                  onClick={copyToClipboard}
                  aria-hidden
                  data-tip={
                    copying === "@theclothingloop"
                      ? t("copiedToClipboard")
                      : t("copy")
                  }
                >
                  @theclothingloop
                </a>
              </li>
              <li className="tw-flex tw-items-center">
                <a
                  href="mailto:hello@clothingloop.com"
                  aria-label="Our email address"
                  className="tw-btn tw-btn-circle tw-btn-outline tw-mr-3 tw-flex tw-justify-center hover:tw-bg-[#0375b9] feather feather-at-sign tw-text-lg"
                ></a>
                <a
                  href="#"
                  tabIndex={1}
                  aria-hidden
                  className={`tw-tooltip tw-tooltip-bottom tw-text-sm ${
                    copying === "hello@clothingloop.com"
                      ? "tw-tooltip-open"
                      : ""
                  }`}
                  onClick={copyToClipboard}
                  data-tip={
                    copying === "hello@clothingloop.com"
                      ? t("copiedToClipboard")
                      : t("copy")
                  }
                >
                  hello@clothingloop.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Newsletter />
      </div>

      <div className="tw-bg-teal tw-text-white">
        <div className="tw-container tw-mx-auto tw-px-20 tw-py-4 tw-flex tw-justify-between">
          <div>
            <Link
              className="tw-btn tw-btn-ghost tw-text-white tw-text-base tw-font-normal"
              to="/terms-of-use"
            >
              {t("termsOfService")}
            </Link>
            <Link
              className="tw-btn tw-btn-ghost tw-text-white tw-text-base tw-font-normal"
              to="/privacy-policy"
            >
              {t("privacy")}
            </Link>
            <a
              className="tw-btn tw-btn-ghost tw-text-white tw-text-base tw-font-normal"
              href="https://github.com/CollActionteam/clothing-loop"
              target="_blank"
            >
              {t("contribute")}
            </a>
          </div>

          <p className="tw-flex tw-items-center" aria-label="copyright">
            <span className="tw-font-bold">The Clothing Loop</span>
            &nbsp;&copy;&nbsp;2022
          </p>
        </div>
      </div>
    </footer>
  );
}
