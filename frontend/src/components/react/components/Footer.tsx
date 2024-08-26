import { Newsletter } from "./Newsletter";
import useToClipboard from "../util/to-clipboard.hooks";
import { useTranslation } from "react-i18next";
import { $authUser } from "../../../stores/auth";
import useLocalizePath from "../util/localize_path.hooks";
import useHydrated from "../util/hydrated.hooks";
import { useStore } from "@nanostores/react";

enum MobileOS {
  ANDROID = "android",
  IOS = "ios",
  OTHER = "",
}

export default function Footer(props: { pathname: string }) {
  const AppStore = "https://images.clothingloop.org/x100/app_store_badge.png";
  const GooglePlay =
    "https://images.clothingloop.org/x100/google_play_badge.png";

  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const authUser = useStore($authUser);
  const addCopyAttributes = useToClipboard();
  const currentYear = new Date().getFullYear();

  const clientValues = useHydrated(() => {
    const userAgent = navigator.userAgent;
    let mobileOS = MobileOS.OTHER;
    if (/android/i.test(userAgent)) {
      mobileOS = MobileOS.ANDROID;
    }
    if (/iPad|iPhone|iPod/i.test(userAgent)) {
      mobileOS = MobileOS.IOS;
    }

    return { mobileOS };
  });

  const isFindPage = props.pathname.includes("/loops/find");
  return (
    <footer className="bg-white pt-8 lg:pt-16 w-full">
      <div className="relative">
        <div
          className="absolute hidden lg:block top-0 ltr:right-0 rtl:left-0 bottom-0 bg-teal-light w-1/2"
          aria-hidden
        ></div>
        <div
          className={`lg:container lg:px-20 mx-auto flex ${
            isFindPage ? "flex-col-reverse" : "flex-col"
          } lg:flex-row-reverse relative z-10`}
        >
          <Newsletter />

          <div className="container mx-auto lg:mx-0 lg:w-1/2 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 items-start sm:justify-end text-center md:text-left lg:mt-8">
              <div className="flex flex-col items-center md:items-start px-3 pb-6 pt-0">
                <span className="text-secondary font-bold text-2xl mb-3">
                  {t("learnMore")}
                </span>
                <a className="link link-hover mb-1" href={localizePath("/faq")}>
                  {t("faq")}
                </a>
                <a
                  className="link link-hover mb-1"
                  href={localizePath("/contact-us")}
                >
                  {t("help")}
                </a>
                <a
                  className="link link-hover mb-1"
                  href={localizePath("/about")}
                >
                  {t("about")}
                </a>
                <a
                  className="link link-hover mb-1"
                  href={localizePath("/contribute")}
                >
                  {t("contribute")}
                </a>
              </div>
              <div className="flex flex-col items-center md:items-start px-3 pb-6 pt-0">
                <span className="text-secondary font-bold text-2xl mb-3">
                  {t("loops")}
                </span>
                <a
                  className="link link-hover mb-1"
                  href={localizePath("/loops/find")}
                >
                  {t("findingALoop")}
                </a>
                <a
                  className="link link-hover mb-1"
                  href={localizePath("/loops/new/users/signup")}
                >
                  {t("startingALoop")}
                </a>
                {clientValues && !!authUser ? (
                  <a
                    className="link link-hover mb-1"
                    href={localizePath("/users/logout")}
                  >
                    {t("logout")}
                  </a>
                ) : (
                  <a
                    className="link link-hover mb-1"
                    href={localizePath("/users/login")}
                  >
                    {t("login")}
                  </a>
                )}
              </div>
              <div className="md:row-span-2 lg:col-span-2 px-3 rtl:md:text-right md:mb-3 lg:mb-0">
                <span className="block text-secondary font-bold text-2xl mb-3">
                  {t("findUs")}
                </span>
                <ul className="inline-grid lg:grid-cols-[min-content_1fr]">
                  <li className="mb-3 inline-flex items-center lg:order-4">
                    <a
                      href="mailto:hello@clothingloop.org"
                      aria-label="Our email address"
                      className="btn btn-circle btn-outline me-3 flex justify-center hover:bg-[#b464a8] icon-mail text-lg"
                    ></a>
                    <span
                      {...addCopyAttributes(t, "footer-copy-email", "text-sm")}
                    >
                      hello@clothingloop.org
                    </span>
                  </li>
                  <li className="mb-3 inline-flex items-center lg:order-2">
                    <a
                      href="https://www.instagram.com/theclothingloop/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-circle btn-outline icon-instagram text-lg me-3 hover:bg-instagram"
                      aria-label="link to our instagram account"
                    ></a>
                    <span
                      {...addCopyAttributes(
                        t,
                        "footer-copy-insta-handle",
                        "text-sm",
                      )}
                    >
                      @theclothingloop
                    </span>
                  </li>
                  <li className="mb-3 inline-flex items-center lg:order-1">
                    <a
                      href="https://www.facebook.com/clothingloop/"
                      rel="noreferrer"
                      aria-label="Our Facebook page"
                      className="flex flex-row items-center group"
                    >
                      <span className="btn btn-circle btn-outline me-3 flex justify-center group-hover:text-white group-hover:border-base-content group-hover:bg-facebook icon-facebook text-lg"></span>
                      <span className="text-sm lg:hidden">Facebook</span>
                    </a>
                  </li>
                  <li className="mb-3 inline-flex items-center lg:order-3">
                    <a
                      href="https://www.linkedin.com/company/the-clothing-loop/"
                      rel="noreferrer"
                      aria-label="Our LinkedIn page"
                      className="flex flex-row items-center group"
                    >
                      <span className="btn btn-circle btn-outline me-3 flex justify-center group-hover:text-white group-hover:border-base-content group-hover:bg-[#0a66c2] icon-linkedin text-lg"></span>
                      <span className="text-sm lg:hidden">LinkedIn</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="md:col-span-2 md:row-start-2 lg:row-start-auto lg:col-span-2 self-end flex justify-center md:justify-start mt-3 mb-6 px-3">
                {/* <a
                  href="https://app.clothingloop.org"
                  target="_blank"
                  className="relative"
                >
                  <div className=" w-[50px] h-[50px] rounded-lg border border-[#a6a6a6] bg-[#000000] text-white me-4 flex flex-col justify-center items-center text-xs">
                    <span className="text-center">Web App</span>
                  </div>
                </a> */}
                {!clientValues ||
                clientValues.mobileOS === MobileOS.IOS ||
                clientValues.mobileOS === MobileOS.OTHER ? (
                  <a
                    href="https://apps.apple.com/us/app/my-clothing-loop/id6451443500"
                    target="_blank"
                    className="relative"
                  >
                    <img
                      src={AppStore}
                      alt="Download on the App Store"
                      style={{ height: 50 }}
                    />
                  </a>
                ) : null}

                {!clientValues ||
                clientValues.mobileOS === MobileOS.ANDROID ||
                clientValues.mobileOS === MobileOS.OTHER ? (
                  <a
                    href="https://play.google.com/store/apps/details?id=org.clothingloop.app"
                    target="_blank"
                    className={`relative ${
                      !clientValues || clientValues.mobileOS === MobileOS.OTHER
                        ? "ms-4"
                        : ""
                    }`}
                  >
                    <img
                      src={GooglePlay}
                      alt="Get it on Google Play"
                      style={{ height: 50 }}
                    />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-teal text-white">
        <div className="container mx-auto px-1 md:px-20 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row sm:flex-wrap mb-2 md:mb-0">
            <a
              className="btn btn-ghost text-white text-base font-normal"
              href={localizePath("/terms-of-use")}
            >
              {t("termsOfService")}
            </a>
            <a
              className="btn btn-ghost text-white text-base font-normal"
              href={localizePath("/terms-of-hosts")}
            >
              {t("termsOfHosts")}
            </a>
            <a
              className="btn btn-ghost text-white text-base font-normal"
              href={localizePath("/data-processing-agreement")}
            >
              {t("dataProcessingAgreement")}
            </a>
            <a
              className="btn btn-ghost text-white text-base font-normal"
              href={localizePath("/privacy-policy")}
            >
              {t("privacy")}
            </a>
          </div>

          <p className="text-center sm:text-right" aria-label="copyright">
            <span className="font-bold">The Clothing Loop</span>
            &nbsp;&copy;&nbsp;{currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}
