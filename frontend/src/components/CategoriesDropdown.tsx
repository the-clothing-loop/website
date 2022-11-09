import * as React from "react";
import { useTranslation } from "react-i18next";

import categories from "../util/categories";
import { GenderI18nKeys, Genders } from "../api/enums";
import { useDropdownCheckBox } from "../util/dropdown.hooks";

interface IProps {
  selectedGenders: Array<Genders | string>;
  handleChange: (genders: Array<Genders | string>) => void;
}

export default function CategoriesDropdown({
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
      className={`tw-w-full tw-dropdown ${
        dropdown.open ? "tw-dropdown-open" : ""
      }`}
      onBlur={() => dropdown.setOpen(false)}
    >
      <label
        tabIndex={0}
        className="tw-btn tw-btn-outline tw-btn-secondary tw-w-full tw-flex tw-justify-between tw-flex-nowrap"
        onClick={() => dropdown.toggle()}
      >
        <span className="tw-truncate">{btnLabel}</span>
        <span
          className={`tw-pl-2 feather ${
            dropdown.open ? "feather-arrow-up" : "feather-arrow-down"
          }`}
        ></span>
      </label>
      <ul
        className="tw-dropdown-content tw-menu tw-bg-white tw-shadow tw-w-44 sm:tw-w-full"
        tabIndex={0}
      >
        {Object.keys(categories).map((gender: string | Genders) => {
          let checked = selectedGenders.includes(gender);
          return (
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  className="tw-checkbox"
                  onClick={() => dropdown.change(gender)}
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
