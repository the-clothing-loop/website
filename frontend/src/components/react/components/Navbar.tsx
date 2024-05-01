import LanguageSwitcher from "./LanguageSwitcher";
import { $authUser, authUserRefresh } from "../../../stores/auth";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import useLocalizePath from "../util/localize_path.hooks";
import useHydrated from "../util/hydrated.hooks";
import ToastManager from "../layout/ToastManager";
import PopupForm from "./PopupForm";

function Navbar(props: { pathname: string }) {
  const { t, i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);
  const authUser = useStore($authUser);

  useHydrated(() => {
    const force = props.pathname.includes("/admin/dashboard");
    setTimeout(() => {
      authUserRefresh(force);
    });
  });

  return (
    <>
      <ToastManager />
      <PopupForm />
      <div className="container mx-auto z-50 bg-white flex flex-row justify-between lg:justify-start items-center md:px-20 shadow-none">
        <a
          aria-label="Clothing Loop logo"
          href={localizePath("/")}
          className="bg-center w-32 md:w-40 h-20 md:h-28 bg-no-repeat relative z-[60] bg-[auto_120px] md:bg-[auto_139px]"
          style={{
            backgroundImage:
              "url('https://images.clothingloop.org/x139/the_clothing_loop_logo.png')",
          }}
        ></a>
        <input type="checkbox" className="hidden peer" id="header-hamburger" />
        <label
          htmlFor="header-hamburger"
          className="mr-3 btn-lg btn-circle btn-ghost hover:bg-base-200 peer-checked:text-secondary peer-checked:animate-[spin-quarter_150ms_linear] flex justify-center items-center lg:hidden relative z-[60] checked:ring-2 checked:ring-offset-2 ring-teal peer-[:checked_>:nth-of-type(1)]:hidden peer-[:checked_>:nth-of-type(2)]:block cursor-pointer"
          aria-label="Menu"
        >
          <span className="icon-menu text-2xl block"></span>
          <span className="icon-x text-2xl hidden"></span>
        </label>
        <div className="hidden peer-checked:block fixed inset-0 lg:!hidden z-50 bg-white"></div>
        <div className="hidden peer-checked:block absolute inset-0 lg:!hidden z-50">
          <nav
            aria-label="mobile site navigation"
            className="container mx-auto h-screen flex flex-col items-center justify-center"
          >
            <a
              href={localizePath("/")}
              className="mb-3 btn btn-ghost text-base"
            >
              {t("home")}
            </a>
            <a
              href={localizePath("/loops/new/users/signup")}
              className="mb-3 btn btn-primary btn-outline"
            >
              <span className="icon-arrow-left mr-3"></span>
              {t("startNewLoop")}
            </a>
            <a
              href={localizePath("/loops/find")}
              className="mb-3 btn btn-primary btn-outline"
            >
              {t("findLoops")}
              <span className="icon-arrow-right ml-3 rtl:hidden"></span>
              <span className="icon-arrow-left mr-3 ltr:hidden"></span>
            </a>

            <a
              href={localizePath("/donate")}
              className="mb-3 btn btn-ghost text-base"
            >
              {t("donate")}
            </a>

            <a
              href={localizePath("/events")}
              className="mb-3 btn btn-ghost text-base"
            >
              {t("events")}
            </a>

            {authUser ? (
              <a
                href={localizePath("/admin/dashboard")}
                className="mb-3 btn btn-ghost text-base relative"
              >
                {t("account")}
                {authUser.notification_chain_uids?.length ? (
                  <div className="block bg-red rounded-full w-2.5 h-2.5 absolute top-1.5 right-1.5"></div>
                ) : null}
              </a>
            ) : (
              <a
                href={localizePath("/users/login")}
                className="mb-3 btn btn-ghost text-base"
              >
                {t("login")}
              </a>
            )}

            <a
              href={localizePath("/about")}
              className="mb-3 btn btn-ghost text-base"
            >
              {t("about")}
            </a>
            <LanguageSwitcher pathname={props.pathname} />
          </nav>
        </div>
        <div className="hidden lg:flex items-center justify-end flex-grow">
          <nav
            aria-label="site navigation"
            className="flex items-center min-h-[4rem]"
          >
            {["/loops/find", "/"].indexOf(props.pathname.substring(3)) !==
            -1 ? (
              <a
                href={localizePath("/loops/new/users/signup")}
                className="ltr:mr-4 rtl:ml-4 btn btn-primary btn-outline"
              >
                {t("startNewLoop")}
              </a>
            ) : (
              <a
                href={localizePath("/loops/find")}
                className="ltr:mr-4 rtl:ml-4 btn btn-primary btn-outline"
              >
                {t("findLoops")}
                <span className="icon-arrow-right ml-4 rtl:hidden"></span>
                <span className="icon-arrow-left mr-4 ltr:hidden"></span>
              </a>
            )}

            <a
              href={localizePath("/donate")}
              className="btn btn-ghost text-base"
            >
              {t("donate")}
            </a>

            <a
              href={localizePath("/events")}
              className="btn btn-ghost text-base"
            >
              {t("events")}
            </a>

            {authUser === undefined ? (
              <div className="opacity-10 btn btn-disabled bg-transparent relative">
                <div className="block bg-black animate-pulse h-6 w-16"></div>
              </div>
            ) : authUser ? (
              <a
                href={localizePath("/admin/dashboard")}
                className="btn btn-ghost text-base relative"
              >
                {t("account")}
                {authUser.notification_chain_uids?.length ? (
                  <div className="block bg-red rounded-full w-2.5 h-2.5 absolute top-1.5 right-1.5"></div>
                ) : null}
              </a>
            ) : (
              <a
                href={localizePath("/users/login")}
                className="btn btn-ghost text-base"
              >
                {t("login")}
              </a>
            )}

            <a
              href={localizePath("/about")}
              className="btn btn-ghost text-base"
            >
              {t("about")}
            </a>

            <LanguageSwitcher
              pathname={props.pathname}
              className="ltr:ml-4 rtl:mr-4"
            />
          </nav>
        </div>
      </div>
    </>
  );
}

export default Navbar;
