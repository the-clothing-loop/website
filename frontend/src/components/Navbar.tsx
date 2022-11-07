import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext } from "react";

// Project resources
import LanguageSwitcher from "./LanguageSwitcher";
import { AuthContext } from "../providers/AuthProvider";

function Navbar() {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);

  let location = useLocation();

  return (
    // Use sticky position to make content start below the Navbar, instead of being covered by it.
    // Note: Not supported by IE 11. See https://material-ui.com/components/app-bar/#fixed-placement

    <div className="tw-container tw-mx-auto tw-z-10 tw-bg-white tw-flex tw-flex-row tw-items-center tw-py-0 tw-px-20 tw-shadow-none tw-sticky">
      <Link
        aria-label="Clothing Loop logo"
        to="/"
        className="tw-h-auto tw-relative "
        style={
          location.pathname === "/"
            ? { width: "220px", height: "150px" }
            : { width: "150px", height: "100px" }
        }
      >
        <img
          className="tw-h-auto tw-relative tw-w-full"
          src="/images/logos/The_Clothing_Loop_Logo.png"
          alt="Logo"
        />
      </Link>
      <div className="tw-flex tw-items-center tw-justify-end tw-flex-grow">
        <div className="tw-flex tw-items-center tw-min-h-[4rem]">
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

          {authUser && (
            <Link to="/admin/dashboard" className="tw-ml-4 tw-btn tw-btn-ghost">
              {t("account")}
            </Link>
          )}

          <Link
            to={authUser ? "/users/logout" : "/users/login"}
            className="tw-ml-4 tw-btn tw-btn-ghost"
          >
            {authUser ? t("logout") : t("login")}
          </Link>

          {authUser === null && (
            <Link to="/about" className="tw-ml-4 tw-btn tw-btn-ghost">
              {t("about")}
            </Link>
          )}

          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
