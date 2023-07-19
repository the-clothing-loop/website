import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//Project resources
import { Newsletter } from "./Newsletter";
import { useContext, useEffect } from "react";
import { AuthContext } from "../providers/AuthProvider";
import useToClipboard from "../util/to-clipboard.hooks";

export default function Footer() {
  const AppStore  = "https://images.clothingloop.org/150x/app_store_badge.png";
  const GooglePlay = "https://images.clothingloop.org/150x/google_play_badge.png"
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  const addCopyAttributes = useToClipboard();
  const currentYear = new Date().getFullYear();


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
              <div className="lg:col-span-2 px-3 pb-6 pt-0 rtl:text-right">
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
            </div>
          </div>
        </div>
      </div>
      <div className="flex bg-white justify-center items-center space-x-4 py-4">
        <img
          src={AppStore}
          alt="App Store Logo"
          width={130}
        />
        <img
          src={GooglePlay}
          alt="Google Play Logo"
          width={144}
        />
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
