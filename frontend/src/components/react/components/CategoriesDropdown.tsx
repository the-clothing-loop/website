import * as React from "react";

import categories from "../util/categories";
import { CatI18nKeys, Categories } from "../../../api/enums";
import { useDropdownCheckBox } from "../util/dropdown.hooks";
import { useTranslation } from "react-i18next";

interface IProps {
  selectedCategories: Array<Categories | string>;
  handleChange: (c: Array<Categories | string>) => void;
  className?: string;
}

export default function CategoriesDropdown({
  className,
  selectedCategories,
  handleChange,
}: IProps) {
  const { t } = useTranslation();

  const dropdown = useDropdownCheckBox({
    selected: selectedCategories,
    handleChange,
  });

  let btnLabel = React.useMemo(() => {
    if (selectedCategories.length) {
      return [...selectedCategories]
        .sort()
        .map((g) => t(CatI18nKeys[g]))
        .join(", ");
    } else {
      return t("categories");
    }
  }, [t, selectedCategories]);

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
          className={`ps-2 ${
            dropdown.open ? "icon-arrow-up" : "icon-arrow-down"
          }`}
        ></span>
      </label>
      <ul
        className="dropdown-content menu bg-white shadow w-44 sm:w-full"
        tabIndex={0}
      >
        {Object.keys(categories).map((c: string | Categories) => {
          let checked = selectedCategories.includes(c);

          return (
            <li key={c}>
              <label>
                <input
                  name="genders"
                  type="checkbox"
                  checked={checked}
                  className="checkbox"
                  onChange={() => dropdown.change(c)}
                />
                {t(CatI18nKeys[c])}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
