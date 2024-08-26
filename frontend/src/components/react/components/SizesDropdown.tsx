import { Fragment, useMemo } from "react";

import categories from "../util/categories";
import { CatI18nKeys, SizeI18nKeys } from "../../../api/enums";
import { useDropdownCheckBox } from "../util/dropdown.hooks";
import { useTranslation } from "react-i18next";

export default function SizesDropdown(props: {
  filteredCategory: string[];
  selectedSizes: string[];
  className?: string;
  handleChange: (selectedSizes: string[]) => void;
}) {
  const { t } = useTranslation();

  const dropdown = useDropdownCheckBox({
    selected: props.selectedSizes,
    handleChange: props.handleChange,
  });

  let btnLabel = useMemo(() => {
    if (props.selectedSizes.length) {
      return [...props.selectedSizes]
        .sort()
        .map((s) => t(SizeI18nKeys[s]))
        .join(", ");
    } else {
      return t("interestedSizes");
    }
  }, [t, props.selectedSizes]);

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
          className={`ps-2 ${
            dropdown.open ? "icon-arrow-up" : "icon-arrow-down"
          }`}
        ></span>
      </label>
      <ul
        className="dropdown-content menu bg-white shadow w-64 sm:w-full"
        tabIndex={0}
      >
        {Object.entries(categories).map(([gender, sizes]) => {
          if (!sizes.length) return null;
          let disabled =
            props.filteredCategory.find((g) => g === gender) === undefined;

          return (
            <Fragment key={gender}>
              <li
                key={"g" + gender}
                className={`px-2 pt-2 capitalize ${
                  disabled ? "text-base-300" : ""
                }`}
              >
                {CatI18nKeys[gender]}
              </li>
              {sizes.map((size) => {
                let checked = props.selectedSizes.includes(size);
                return (
                  <li className={disabled ? "disabled" : ""} key={"s" + size}>
                    <label>
                      <input
                        name="sizes"
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        className="checkbox"
                        onChange={() => dropdown.change(size)}
                      />
                      {t(SizeI18nKeys[size])}
                    </label>
                  </li>
                );
              })}
            </Fragment>
          );
        })}
      </ul>
    </div>
  );
}
