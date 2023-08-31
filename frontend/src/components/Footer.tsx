import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Newsletter } from "./Newsletter";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../providers/AuthProvider";
import useToClipboard from "../util/to-clipboard.hooks";

enum MobileOS {
  ANDROID = "android",
  IOS = "ios",
  OTHER = "",
}

export default function Footer() {
  const AppStore = "https://images.clothingloop.org/x100/app_store_badge.png";
  const GooglePlay =
    "https://images.clothingloop.org/x100/google_play_badge.png";
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const addCopyAttributes = useToClipboard();
  const currentYear = new Date().getFullYear();
  const [mobileOS, setMobileOS] = useState<MobileOS>(MobileOS.OTHER);
  useEffect(() => {
    const detectMobileOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor;

      if (/android/i.test(userAgent)) {
        return MobileOS.ANDROID;
      }

      if (/iPad|iPhone|iPod/i.test(userAgent)) {
        return MobileOS.IOS;
      }

      return MobileOS.OTHER;
    };

    const os = detectMobileOS();
    setMobileOS(os);
  }, []);
  return (
    <footer className="bg-white pt-8 lg:pt-16 w-full">
      <div className="relative">
        <div
          className="absolute hidden lg:block top-0 ltr:right-0 rtl:left-0 bottom-0 bg-teal-light w-1/2"
          aria-hidden
        ></div>
        <div className="lg:container lg:px-20 mx-auto flex flex-col lg:flex-row-reverse relative z-10">
          <Newsletter />

          <div className="container mx-auto lg:mx-0 lg:w-1/2 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 items-center ltr:md:items-start rtl:md:items-end sm:justify-end text-center md:text-left lg:mt-8">
              <div className="flex flex-col items-center md:items-start px-3 pb-6 pt-0">
                <span className="text-secondary font-bold text-2xl mb-3">
                  {t("learnMore")}
                </span>
                <Link className="link link-hover mb-1" to="/faq">
                  {t("faq")}
                </Link>
                <Link className="link link-hover mb-1" to="/contact-us">
                  {t("help")}
                </Link>
                <Link className="link link-hover mb-1" to="/about">
                  {t("about")}
                </Link>
              </div>
              <div className="flex flex-col items-center md:items-start px-3 pb-6 pt-0">
                <span className="text-secondary font-bold text-2xl mb-3">
                  {t("loops")}
                </span>
                <Link className="link link-hover mb-1" to="/loops/find">
                  {t("findingALoop")}
                </Link>
                <Link
                  className="link link-hover mb-1"
                  to="/loops/new/users/signup"
                >
                  {t("startingALoop")}
                </Link>
                {authUser ? (
                  <Link className="link link-hover mb-1" to="/users/logout">
                    {t("logout")}
                  </Link>
                ) : (
                  <Link className="link link-hover mb-1" to="/users/login">
                    {t("login")}
                  </Link>
                )}
              </div>
              <div className="md:row-span-2 lg:col-span-2  px-3 rtl:text-right md:mb-3 lg:mb-0">
                <span className="block text-secondary font-bold text-2xl mb-3">
                  {t("findUs")}
                </span>
                <ul className="inline-grid lg:grid-cols-[min-content_1fr]">
                  <li className="mb-3 inline-flex items-center lg:order-4">
                    <a
                      href="mailto:hello@clothingloop.org"
                      aria-label="Our email address"
                      className="btn btn-circle btn-outline mr-3 rtl:mr-0 rtl:ml-3 flex justify-center hover:bg-[#b464a8] feather feather-mail text-lg"
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
                      className="btn btn-circle btn-outline feather feather-instagram text-lg mr-3 rtl:mr-0 rtl:ml-3 hover:bg-instagram"
                      aria-label="link to our instagram account"
                    ></a>
                    <span
                      {...addCopyAttributes(
                        t,
                        "footer-copy-insta-handle",
                        "text-sm"
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
                      <span className="btn btn-circle btn-outline mr-3 rtl:mr-0 rtl:ml-3 flex justify-center group-hover:text-white group-hover:border-base-content group-hover:bg-facebook feather feather-facebook text-lg"></span>
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
                      <span className="btn btn-circle btn-outline mr-3 rtl:mr-0 rtl:ml-3 flex justify-center group-hover:text-white group-hover:border-base-content group-hover:bg-[#0a66c2] feather feather-linkedin text-lg"></span>
                      <span className="text-sm lg:hidden">LinkedIn</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="md:col-span-2 md:row-start-2 lg:row-start-auto lg:col-span-2 self-end flex justify-center md:justify-start mt-3 mb-6 px-3">
                {mobileOS === MobileOS.IOS || mobileOS === MobileOS.OTHER ? (
                  <a
                    href="https://testflight.apple.com/join/bFOGBLNw"
                    target="_blank"
                    className="relative"
                  >
                    <img
                      src={AppStore}
                      alt="Download on the App Store"
                      style={{ height: 50 }}
                    />
                    <span className="absolute -top-2 -right-2 block rounded py-0.5 px-1.5 text-xs bg-blue font-semibold tracking-widest text-white">
                      Beta
                    </span>
                  </a>
                ) : null}

                {mobileOS === MobileOS.ANDROID ||
                mobileOS === MobileOS.OTHER ? (
                  <a
                    href="https://play.google.com/apps/testing/org.clothingloop.app"
                    target="_blank"
                    className={`relative ${
                      mobileOS === MobileOS.OTHER ? "ms-4" : ""
                    }`}
                  >
                    <img
                      src={GooglePlay}
                      alt="Get it on Google Play"
                      style={{ height: 50 }}
                    />
                    <span className="absolute -top-2 -right-2 block rounded py-0.5 px-1.5 text-xs bg-blue font-semibold tracking-widest text-white">
                      Beta
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-teal text-white">
        <div className="container mx-auto px-1 md:px-20 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row sm:flex-wrap mb-2 md:mb-0">
            <Link
              className="btn btn-ghost text-white text-base font-normal"
              to="/terms-of-use"
            >
              {t("termsOfService")}
            </Link>
            <Link
              className="btn btn-ghost text-white text-base font-normal"
              to="/privacy-policy"
            >
              {t("privacy")}
            </Link>
            <a
              className="btn btn-ghost text-white text-base font-normal"
              href="https://github.com/the-clothing-loop/website"
              target="_blank"
              rel="noreferrer"
            >
              {t("contribute")}
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
