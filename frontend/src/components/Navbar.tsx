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
        className="tw-bg-center tw-w-48 tw-h-36 tw-bg-no-repeat"
        style={{
          backgroundImage: "url('/images/logos/the_clothing_loop_logo.png')",
          backgroundSize: "auto 180px",
        }}
      ></Link>
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

          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
