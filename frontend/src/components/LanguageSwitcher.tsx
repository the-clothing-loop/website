import dayjs from "../util/dayjs";
import { useMemo, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useDropdown } from "../util/dropdown.hooks";
import { getLanguageFlags } from "../languages";
import { userUpdate, UserUpdateBody } from "../api/user";
import { UID } from "../api/types";

const IS_PRODUCTION =
  import.meta.env.VITE_BASE_URL === "https://www.clothingloop.org";

const languageFlags = getLanguageFlags(IS_PRODUCTION);

const LanguageSwitcher = (props: {
  className?: string;
  userUID: UID;
  chainUID?: UID;
}) => {
  const { i18n } = useTranslation();
  const history = useHistory();

  const dropdown = useDropdown();

  const handleChange = (lng: string) => {
    dayjs.locale(lng);
    i18n.changeLanguage(lng);
    history.replace(
      // from /en/about to /nl/about
      `/${lng}${history.location.pathname.substring(3)}`,
      history.location.state
    );
    dropdown.setOpen(false);

    // Update the value of i18n in the database
    let userUpdateBody: UserUpdateBody = {
      user_uid: props.userUID,
      chain_uid: props.chainUID,
      i18n: lng,
    };
    userUpdate(userUpdateBody);
  };

  const btnLabelLanguage = useMemo(() => {
    return (
      languageFlags.find((l) => l.lng === i18n.language) || languageFlags[0]
    );
  }, [i18n.language]);

  function onToggle(e: MouseEvent<HTMLLabelElement>) {
    // This ensures that the onClick event doesn't bubble up to the mobile navbar
    // see Navbar.tsx
    e.stopPropagation();
    dropdown.toggle();
  }

  return (
    <div
      className={`dropdown dropdown-end dropdown-bottom ${
        dropdown.open ? "dropdown-open" : ""
      } ${props.className || ""}`}
      onBlur={() => dropdown.setOpen(false)}
    >
      <label
        tabIndex={0}
        className="btn btn-outline w-36 justify-between"
        onClick={onToggle}
      >
        {btnLabelLanguage.title}
        <img
          className="w-6 ml-2"
          src={btnLabelLanguage.flag}
          alt={btnLabelLanguage.title + " flag"}
        />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu w-36 shadow bg-base-100"
      >
        {languageFlags.map((el) => {
          let active = btnLabelLanguage.lng === el.lng;
          return (
            <li key={el.lng} className={active ? "hidden" : ""}>
              <button
                className="flex justify-between text-sm"
                onClick={() => handleChange(el.lng)}
              >
                {el.title}
                <img className="w-6" src={el.flag} alt={el.title + " flag"} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LanguageSwitcher;
