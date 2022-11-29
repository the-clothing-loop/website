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

  function onClickMobileNavLink() {
    const el = document.getElementById("header-hamburger") as HTMLInputElement;
    console.log(el.value);

    el.checked = false;
  }

  return (
    // Use sticky position to make content start below the Navbar, instead of being covered by it.
    // Note: Not supported by IE 11. See https://material-ui.com/components/app-bar/#fixed-placement

    <div className="container mx-auto z-50 bg-white flex flex-row justify-between lg:justify-start items-center py-0 px-1 md:px-20 shadow-none">
      <Link
        aria-label="Clothing Loop logo"
        to="/"
        className="bg-center w-48 h-36 bg-no-repeat relative z-[60]"
        style={{
          backgroundImage: "url('/images/logos/the_clothing_loop_logo.png')",
          backgroundSize: "auto 180px",
        }}
      ></Link>
      <input type="checkbox" className="hidden peer" id="header-hamburger" />
      <label
        htmlFor="header-hamburger"
        className="btn-lg btn-circle btn-ghost hover:bg-base-200 peer-checked:text-secondary peer-checked:animate-[spin-half_300ms_linear] flex justify-center items-center lg:hidden relative z-[60] checked:ring-2 checked:ring-offset-2 ring-teal"
      >
        <span className="feather feather-menu text-2xl"></span>
      </label>
      <div className="hidden peer-checked:block fixed inset-0 lg:!hidden z-50 bg-white">
        <nav
          aria-label="mobile site navigation"
          onClick={onClickMobileNavLink}
          className="container mx-auto px-20 flex flex-col items-center pt-40"
        >
          <Link
            to="/loops/new/users/signup"
            className="mb-3 btn btn-primary btn-outline"
          >
            <span className="feather feather-arrow-left mr-4"></span>
            {t("startNewLoop")}
          </Link>
          <Link to="/loops/find" className="mb-3 btn btn-primary btn-outline">
            {t("findLoops")}
            <span className="feather feather-arrow-right ml-4"></span>
          </Link>

          <Link to="/donate" className="mb-3 btn btn-ghost text-base">
            {t("donate")}
          </Link>

          {authUser && (
            <Link
              to="/admin/dashboard"
              className="mb-3 btn btn-ghost text-base"
            >
              {t("account")}
            </Link>
          )}

          <Link
            to={authUser ? "/users/logout" : "/users/login"}
            className="mb-3 btn btn-ghost text-base"
          >
            {authUser ? t("logout") : t("login")}
          </Link>

          <Link to="/about" className="mb-3 btn btn-ghost text-base">
            {t("about")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
      <div className="hidden lg:flex items-center justify-end flex-grow">
        <nav
          aria-label="site navigation"
          className="flex items-center min-h-[4rem]"
        >
          {["/loops/find", "/"].indexOf(location.pathname) !== -1 && (
            <Link
              to="/loops/new/users/signup"
              className="btn btn-primary btn-outline"
            >
              {t("startNewLoop")}
            </Link>
          )}

          {authUser === null &&
          ["/loops/find", "/"].indexOf(location.pathname) === -1 ? (
            <Link to="/loops/find" className="ml-4 btn btn-primary btn-outline">
              {t("findLoops")}
              <span className="feather feather-arrow-right ml-4"></span>
            </Link>
          ) : null}

          <Link to="/donate" className="ml-4 btn btn-ghost text-base">
            {t("donate")}
          </Link>

          {authUser && (
            <Link
              to="/admin/dashboard"
              className="ml-4 btn btn-ghost text-base"
            >
              {t("account")}
            </Link>
          )}

          <Link
            to={authUser ? "/users/logout" : "/users/login"}
            className="ml-4 btn btn-ghost text-base"
          >
            {authUser ? t("logout") : t("login")}
          </Link>

          {authUser === null && (
            <Link to="/about" className="ml-4 btn btn-ghost text-base">
              {t("about")}
            </Link>
          )}

          <LanguageSwitcher className="ml-4" />
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
