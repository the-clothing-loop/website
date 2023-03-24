import * as React from "react";
import { useTranslation } from "react-i18next";

import { DistanceI18nKeys, Distance } from "../api/enums";
import { useDropdownRadio } from "../util/dropdown.hooks";

interface IProps {
  selectedDistance: Distance | string;
  handleChange: (distance: Distance | string) => void;
  className?: string;
}

export default function DistanceDropdown({
  className,
  selectedDistance,
  handleChange,
}: IProps) {
  const { t } = useTranslation();

  const dropdown = useDropdownRadio({
    selected: selectedDistance,
    handleChange,
  });

  let btnLabel = React.useMemo(() => {
    if (selectedDistance) {
      return [selectedDistance].map((g) => DistanceI18nKeys[g]);
    } else {
      return t("distance");
    }
  }, [selectedDistance]);

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
        {Object.keys(DistanceI18nKeys).map((distance: string | Distance) => {
          let checked = selectedDistance == distance;
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
