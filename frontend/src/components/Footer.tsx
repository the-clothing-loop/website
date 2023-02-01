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
    <footer className="bg-white pt-8 lg:pt-32 w-full">
      <div className="relative">
        <div
          className="absolute hidden lg:block top-0 right-0 bottom-0 bg-teal-light w-1/2"
          aria-hidden
        ></div>
        <div className="lg:container lg:px-20 mx-auto flex flex-col lg:flex-row-reverse relative z-10">
          <Newsletter />
          <div className="container mx-auto lg:mx-0 lg:w-1/2 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 items-center md:items-start sm:justify-end text-center md:text-left lg:mt-8">
              <div className="flex flex-col items-center md:items-start px-3 pb-6 pt-0">
                <span className="text-secondary font-bold text-2xl mb-3">
                  {t("learnMore")}
                </span>
                <Link className="link link-hover mb-1" to="/faq">
                  {t("faqs")}
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
              <div className="px-3 pb-6 pt-0">
                <span className="block text-secondary font-bold text-2xl mb-3">
                  {t("findUs")}
                </span>
                <ul className="inline-flex flex-col">
                  <li className="mb-3 inline-flex items-center">
                    <a
                      href="https://www.instagram.com/theclothingloop/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-circle btn-outline feather feather-instagram text-lg mr-3 hover:bg-instagram"
                      aria-label="link to our instagram account"
                    ></a>
                    <span
                      tabIndex={1}
                      className={`tooltip tooltip-bottom text-sm ${
                        copying === "@theclothingloop" ? "tooltip-open" : ""
                      }`}
                      onClick={copyToClipboard}
                      data-tip={
                        copying === "@theclothingloop"
                          ? t("copiedToClipboard")
                          : t("copy")
                      }
                    >
                      @theclothingloop
                    </span>
                  </li>
                  <li className="mb-3 inline-flex items-center">
                    <a
                      href="mailto:hello@clothingloop.org"
                      aria-label="Our email address"
                      className="btn btn-circle btn-outline mr-3 flex justify-center hover:bg-[#0375b9] feather feather-at-sign text-lg"
                    ></a>
                    <span
                      tabIndex={1}
                      className={`tooltip tooltip-bottom text-sm ${
                        copying === "hello@clothingloop.org"
                          ? "tooltip-open"
                          : ""
                      }`}
                      onClick={copyToClipboard}
                      data-tip={
                        copying === "hello@clothingloop.org"
                          ? t("copiedToClipboard")
                          : t("copy")
                      }
                    >
                      hello@clothingloop.org
                    </span>
                  </li>
                  <li className="inline-flex items-center">
                    <a
                      href="#"
                      aria-label="Our LinkedIn"
                      className="btn btn-circle btn-outline mr-3 flex justify-center hover:bg-[#0a66c2] feather feather-linkedin text-lg"
                    ></a>
                    <span className="text-sm">LinkedIn</span>
                  </li>
                </ul>
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
            &nbsp;&copy;&nbsp;2022
          </p>
        </div>
      </div>
    </footer>
  );
}
