import { useMemo, type MouseEvent } from "react";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";

import { useDropdown } from "../util/dropdown.hooks";
import { getLanguageFlags } from "../../../languages";
import { userUpdate } from "../../../api/user";
import { $authUser } from "../../../stores/auth";
import useLocalizePath from "../util/localize_path.hooks";

const IS_PRODUCTION =
  import.meta.env.PUBLIC_BASE_URL === "https://www.clothingloop.org";

const languageFlags = getLanguageFlags(IS_PRODUCTION);

export default function LanguageSwitcher(props: {
  className?: string;
  pathname: string;
}) {
  const { i18n } = useTranslation();
  const localizePath = useLocalizePath(i18n);

  const authUser = useStore($authUser);
  const dropdown = useDropdown();

  const btnLabelLanguage = useMemo(() => {
    return (
      languageFlags.find((l) => l.lng === i18n.language) || languageFlags[0]
    );
  }, [i18n.language]);

  function handleChange(e: MouseEvent, lng: string) {
    e.preventDefault();
    (async () => {
      if (authUser) {
        // Update the value of i18n in the database
        await userUpdate({
          user_uid: authUser.uid,
          i18n: lng,
        }).catch((e) => {
          console.error(e);
        });
      }
      window.location.href = localizePath(
        window.location.pathname + window.location.search,
        lng,
      );
    })();
  }

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
        className="btn btn-outline w-40 justify-between flex flex-row"
        onClick={onToggle}
        dir="ltr"
      >
        <p
          className={`grow ${btnLabelLanguage.rtl ? "text-right" : "text-left"}`}
        >
          {btnLabelLanguage.title}
        </p>
        <span className="uppercase font-bold">{btnLabelLanguage.code}</span>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu w-40 shadow bg-base-100"
        dir="ltr"
      >
        {languageFlags.map((el) => {
          let active = btnLabelLanguage.lng === el.lng;
          return (
            <li key={el.lng} className={active ? "hidden" : ""}>
              <a
                className="flex justify-between text-sm"
                href={localizePath("/", el.lng)}
                onClick={(e) => handleChange(e, el.lng)}
              >
                <span className={el.rtl ? "w-full text-right" : ""}>
                  {el.title}
                </span>
                <span className="uppercase font-bold">{el.code}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
