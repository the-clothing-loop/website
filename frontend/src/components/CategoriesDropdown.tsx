import * as React from "react";
import { useTranslation } from "react-i18next";

import categories from "../util/categories";
import { GenderI18nKeys, Genders } from "../api/enums";
import { useDropdownCheckBox } from "../util/dropdown.hooks";

interface IProps {
  selectedGenders: Array<Genders | string>;
  handleChange: (genders: Array<Genders | string>) => void;
  className?: string;
}

export default function CategoriesDropdown({
  className,
  selectedGenders,
  handleChange,
}: IProps) {
  const { t } = useTranslation();

  const dropdown = useDropdownCheckBox({
    selected: selectedGenders,
    handleChange,
  });

  let btnLabel = React.useMemo(() => {
    if (selectedGenders.length) {
      return [...selectedGenders]
        .sort()
        .map((g) => t(GenderI18nKeys[g]))
        .join(", ");
    } else {
      return t("categories");
    }
  }, [t, selectedGenders]);

  return (
    <div
      className={`w-full dropdown ${
        dropdown.open ? "dropdown-open" : ""
      } ${className}`}
      onBlur={() => dropdown.setOpen(false)}
    >
      <label
        tabIndex={0}
        className="btn btn-outline no-animation btn-secondary w-full flex justify-between flex-nowrap"
        onClick={() => dropdown.toggle()}
      >
        <span className="truncate">{btnLabel}</span>
        <span
          className={`pl-2 rtl:pl-0 rtl:pr-2 feather ${
            dropdown.open ? "feather-arrow-up" : "feather-arrow-down"
          }`}
        ></span>
      </label>
      <ul
        className="dropdown-content menu bg-white shadow w-44 sm:w-full"
        tabIndex={0}
      >
        {Object.keys(categories).map((gender: string | Genders) => {
          let checked = selectedGenders.includes(gender);
          return (
            <li key={gender}>
              <label>
                <input
                  name="genders"
                  type="checkbox"
                  checked={checked}
                  className="checkbox"
                  onChange={() => dropdown.change(gender)}
                />
                {t(GenderI18nKeys[gender])}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
