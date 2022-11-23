import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";

// Project resources
import LanguageSwitcher from "./LanguageSwitcher";
import { AuthContext } from "../providers/AuthProvider";

enum MenuState {
  OPEN,
  ANIMATING,
  CLOSED,
}

function Navbar() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);
  let location = useLocation();

  return (
    // Use sticky position to make content start below the Navbar, instead of being covered by it.
    // Note: Not supported by IE 11. See https://material-ui.com/components/app-bar/#fixed-placement

    <div className="tw-container tw-mx-auto tw-z-50 tw-bg-white tw-flex tw-flex-row tw-justify-between lg:tw-justify-start tw-items-center tw-py-0 tw-px-1 md:tw-px-20 tw-shadow-none">
      <Link
        aria-label="Clothing Loop logo"
        to="/"
        className="tw-bg-center tw-w-48 tw-h-36 tw-bg-no-repeat tw-relative tw-z-[60]"
        style={{
          backgroundImage: "url('/images/logos/the_clothing_loop_logo.png')",
          backgroundSize: "auto 180px",
        }}
      ></Link>
      <input
        type="checkbox"
        className="tw-hidden tw-peer"
        id="header-hamburger"
      />
      <label
        htmlFor="header-hamburger"
        className="tw-btn-lg tw-btn-circle tw-btn-ghost hover:tw-bg-base-200 peer-checked:tw-text-secondary peer-checked:tw-animate-[spin-half_300ms_linear] tw-flex tw-justify-center tw-items-center lg:tw-hidden tw-relative tw-z-[60] checked:tw-ring-2 checked:tw-ring-offset-2 tw-ring-teal"
      >
        <span className="feather feather-menu tw-text-2xl"></span>
      </label>
      <div className="tw-hidden peer-checked:tw-block tw-fixed tw-inset-0 lg:!tw-hidden tw-z-50 tw-bg-white">
        <nav
          aria-label="mobile site navigation"
          className="tw-container tw-mx-auto tw-px-20 tw-flex tw-flex-col tw-items-center tw-pt-40"
        >
          <Link
            to="/loops/new/users/signup"
            className="tw-mb-3 tw-btn tw-btn-primary tw-btn-outline"
          >
            <span className="feather feather-arrow-left tw-mr-4"></span>
            {t("startNewLoop")}
          </Link>
          <Link
            to="/loops/find"
            className="tw-mb-3 tw-btn tw-btn-primary tw-btn-outline"
          >
            {t("findLoops")}
            <span className="feather feather-arrow-right tw-ml-4"></span>
          </Link>

          <Link
            to="/donate"
            className="tw-mb-3 tw-btn tw-btn-ghost tw-text-base"
          >
            {t("donate")}
          </Link>

          {authUser && (
            <Link
              to="/admin/dashboard"
              className="tw-mb-3 tw-btn tw-btn-ghost tw-text-base"
            >
              {t("account")}
            </Link>
          )}

          <Link
            to={authUser ? "/users/logout" : "/users/login"}
            className="tw-mb-3 tw-btn tw-btn-ghost tw-text-base"
          >
            {authUser ? t("logout") : t("login")}
          </Link>

          <Link
            to="/about"
            className="tw-mb-3 tw-btn tw-btn-ghost tw-text-base"
          >
            {t("about")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
      <div className="tw-hidden lg:tw-flex tw-items-center tw-justify-end tw-flex-grow">
        <nav
          aria-label="site navigation"
          className="tw-flex tw-items-center tw-min-h-[4rem]"
        >
          {["/loops/find", "/"].indexOf(location.pathname) !== -1 && (
            <Link
              to="/loops/new/users/signup"
              className="tw-btn tw-btn-primary tw-btn-outline"
            >
              {t("startNewLoop")}
            </Link>
          )}

          {authUser === null &&
          ["/loops/find", "/"].indexOf(location.pathname) === -1 ? (
            <Link
              to="/loops/find"
              className="tw-ml-4 tw-btn tw-btn-primary tw-btn-outline"
            >
              {t("findLoops")}
              <span className="feather feather-arrow-right tw-ml-4"></span>
            </Link>
          ) : null}

          <Link
            to="/donate"
            className="tw-ml-4 tw-btn tw-btn-ghost tw-text-base"
          >
            {t("donate")}
          </Link>

          {authUser && (
            <Link
              to="/admin/dashboard"
              className="tw-ml-4 tw-btn tw-btn-ghost tw-text-base"
            >
              {t("account")}
            </Link>
          )}

          <Link
            to={authUser ? "/users/logout" : "/users/login"}
            className="tw-ml-4 tw-btn tw-btn-ghost tw-text-base"
          >
            {authUser ? t("logout") : t("login")}
          </Link>

          {authUser === null && (
            <Link
              to="/about"
              className="tw-ml-4 tw-btn tw-btn-ghost tw-text-base"
            >
              {t("about")}
            </Link>
          )}

          <LanguageSwitcher className="tw-ml-4" />
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
