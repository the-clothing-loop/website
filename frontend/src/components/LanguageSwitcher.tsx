import { useMemo, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useDropdown } from "../util/dropdown.hooks";

const IS_PRODUCTION =
  process.env.REACT_APP_BASE_URL === "https://www.clothingloop.org";

const testLanguages = [
  { lng: "de", title: "German", flag: "/icons/flags/de.svg" },
  { lng: "fr", title: "French", flag: "/icons/flags/fr.svg" },
];

let languages = [
  { lng: "en", title: "English", flag: "/icons/flags/gb.svg" },
  { lng: "nl", title: "Dutch", flag: "/icons/flags/nl.svg" },
];

if (!IS_PRODUCTION) {
  languages.push(...testLanguages);
}

const LanguageSwitcher = (props: { className?: string }) => {
  const { i18n } = useTranslation();

  const dropdown = useDropdown();

  const handleChange = (lng: string) => {
    i18n.changeLanguage(lng);
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
