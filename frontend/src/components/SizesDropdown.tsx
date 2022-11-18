import * as React from "react";
import { useTranslation } from "react-i18next";

import categories from "../util/categories";
import { GenderI18nKeys, SizeI18nKeys } from "../api/enums";
import { useDropdownCheckBox } from "../util/dropdown.hooks";

export default function SizesDropdown(props: {
  filteredGenders: string[];
  selectedSizes: string[];
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
      <li className={disabled ? "tw-disabled" : ""} key={size}>
        <label>
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="tw-checkbox"
            onClick={() => dropdown.change(size)}
          />
          {t(SizeI18nKeys[size])}
        </label>
      </li>
    );
  }

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
        className="tw-dropdown-content tw-menu tw-bg-white tw-shadow tw-w-64 sm:tw-w-full"
        tabIndex={0}
      >
        {Object.entries(categories).map(([gender, sizes]) => {
          let disabled =
            props.filteredGenders.find((g) => g == gender) == undefined;

          return (
            <>
              <li
                key={gender}
                className={`tw-px-2 tw-pt-2 tw-capitalize ${
                  disabled ? "tw-text-base-300" : ""
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
