import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDropdown } from "../util/dropdown.hooks";

const LanguageSwitcher = (props: { className?: string }) => {
  const languages = [
    { lng: "en", title: "English", flag: "/icons/flags/gb.svg" },
    { lng: "nl", title: "Dutch", flag: "/icons/flags/nl.svg" },
  ];
  const { i18n } = useTranslation();

  const dropdown = useDropdown();

  const handleChange = (lng: string) => {
    i18n.changeLanguage(lng);
    dropdown.setOpen(false);
  };

  const btnLabelLanguage = useMemo(() => {
    return languages.find((l) => l.lng == i18n.language) || languages[0];
  }, [i18n.language]);

  return (
    <div
      className={`dropdown dropdown-end dropdown-bottom ${
        dropdown.open ? "dropdown-open" : ""
      } ${props.className || ""}`}
      onBlur={() => dropdown.setOpen(false)}
    >
      <label tabIndex={0} className="btn btn-outline" onClick={dropdown.toggle}>
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
          let active = btnLabelLanguage.lng == el.lng;
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
