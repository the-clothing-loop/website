import { useMemo, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useDropdown } from "../util/dropdown.hooks";

const IS_PRODUCTION =
  import.meta.env.VITE_BASE_URL === "https://www.clothingloop.org";

interface Language {
  lng: string;
  title: string;
  flag: string;
}
const testLanguages: Language[] = [];

let languages: Language[] = [
  { lng: "en", title: "English", flag: "/images/flags/gb.svg" },
  { lng: "nl", title: "Dutch", flag: "/images/flags/nl.svg" },
  { lng: "de", title: "German", flag: "/images/flags/de.svg" },
  { lng: "fr", title: "French", flag: "/images/flags/fr.svg" },
  { lng: "es", title: "Spanish", flag: "/images/flags/es.svg" },
  { lng: "sv", title: "Swedish", flag: "/images/flags/se.svg" },
];

if (!IS_PRODUCTION) {
  languages.push(...testLanguages);
}

const LanguageSwitcher = (props: { className?: string }) => {
  const { i18n } = useTranslation();
  const history = useHistory();

  const dropdown = useDropdown();

  const handleChange = (lng: string) => {
    i18n.changeLanguage(lng);
    history.replace(
      // from /en/about to /nl/about
      `/${lng}${history.location.pathname.substring(3)}`,
      history.location.state
    );
    dropdown.setOpen(false);
  };

  const btnLabelLanguage = useMemo(() => {
    return languages.find((l) => l.lng === i18n.language) || languages[0];
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
      <label tabIndex={0} className="btn btn-outline" onClick={onToggle}>
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
        {languages.map((el) => {
          let active = btnLabelLanguage.lng === el.lng;
          return (
            <li key={el.lng} className={active ? "hidden" : ""}>
              <button
                className="flex justify-between"
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
