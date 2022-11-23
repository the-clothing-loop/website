import * as React from "react";
import { useTranslation } from "react-i18next";

import categories from "../util/categories";
import { GenderI18nKeys, SizeI18nKeys } from "../api/enums";
import { useDropdownCheckBox } from "../util/dropdown.hooks";

export default function SizesDropdown(props: {
  filteredGenders: string[];
  selectedSizes: string[];
  className?: string;
  handleChange: (selectedSizes: string[]) => void;
}) {
  const { t } = useTranslation();

  const dropdown = useDropdownCheckBox({
    selected: props.selectedSizes,
    handleChange: props.handleChange,
  });

  let btnLabel = React.useMemo(() => {
    if (props.selectedSizes.length) {
      return [...props.selectedSizes]
        .sort()
        .map((s) => t(SizeI18nKeys[s]))
        .join(", ");
    } else {
      return t("sizes");
    }
  }, [t, props.selectedSizes]);

  function Item(size: string, disabled: boolean) {
    let checked = props.selectedSizes.includes(size);
    return (
      <li className={disabled ? "disabled" : ""} key={size}>
        <label>
          <input
            name="sizes"
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="checkbox"
            onClick={() => dropdown.change(size)}
          />
          {t(SizeI18nKeys[size])}
        </label>
      </li>
    );
  }

  return (
    <div
      className={`w-full dropdown ${dropdown.open ? "dropdown-open" : ""} ${
        props.className
      }`}
      onBlur={() => dropdown.setOpen(false)}
    >
      <label
        tabIndex={0}
        className="btn btn-outline no-animation btn-secondary w-full flex justify-between flex-nowrap"
        onClick={() => dropdown.toggle()}
      >
        <span className="truncate">{btnLabel}</span>
        <span
          className={`pl-2 feather ${
            dropdown.open ? "feather-arrow-up" : "feather-arrow-down"
          }`}
        ></span>
      </label>
      <ul
        className="dropdown-content menu bg-white shadow w-64 sm:w-full"
        tabIndex={0}
      >
        {Object.entries(categories).map(([gender, sizes]) => {
          let disabled =
            props.filteredGenders.find((g) => g == gender) == undefined;

          return (
            <>
              <li
                key={gender}
                className={`px-2 pt-2 capitalize ${
                  disabled ? "text-base-300" : ""
                }`}
              >
                {GenderI18nKeys[gender]}
              </li>
              {sizes.map((size) => Item(size as string, disabled))}
            </>
          );
        })}
      </ul>
    </div>
  );
}
