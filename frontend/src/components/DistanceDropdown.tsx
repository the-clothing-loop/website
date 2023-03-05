import * as React from "react";
import { useTranslation } from "react-i18next";

import categories from "../util/categories";
import { DistanceI18nKeys, Distance } from "../api/enums";
import { useDropdownCheckBox } from "../util/dropdown.hooks";


const distance = {
  [Distance.km1]: [
    Distance["km1"],
  ],
  [Distance.km5]: [
    Distance["km5"],
  ],
  [Distance.km10]: [
    Distance["km10"],
  ],
  [Distance.km15]: [
    Distance["km15"],
  ],
  [Distance.km20]: [
    Distance["km20"],
  ],
};

export const allSizes = Object.values(distance).reduce(
  (prev, current) => prev.concat(current)
);

interface IProps {
  selectedDistance: Array<Distance | string>;
  handleChange: (distance: Array<Distance | string>) => void;
  className?: string;
}

export default function CategoriesDropdown({
  className,
  selectedDistance,
  handleChange,
}: IProps) {
  const { t } = useTranslation();

  const dropdown = useDropdownCheckBox({
    selected: selectedDistance,
    handleChange,
  });

  let btnLabel = React.useMemo(() => {
    if (selectedDistance.length) {
      return [...selectedDistance]
        .sort()
        .map((g) => t(DistanceI18nKeys[g]))
        .join(", ");
    } else {
      // Add translation
      return "Distance";
    }
  }, [t, selectedDistance]);

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
          className={`pl-2 feather ${
            dropdown.open ? "feather-arrow-up" : "feather-arrow-down"
          }`}
        ></span>
      </label>
      <ul
        className="dropdown-content menu bg-white shadow w-44 sm:w-full"
        tabIndex={0}
      >
        {Object.keys(distance).map((distance: string | Distance) => {
          let checked = selectedDistance.includes(distance);
          return (
            <li key={distance}>
              <label>
                <input
                  name="distance"
                  type="checkbox"
                  checked={checked}
                  className="checkbox"
                  onChange={() => dropdown.change(distance)}
                />
                {t(DistanceI18nKeys[distance])}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
