import { TFunction } from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useDropdownRadio } from "../util/dropdown.hooks";

interface IProps {
  // -1 is any distance
  selectedDistance: number;
  handleChange: (distance: number) => void;
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

  function label(t: TFunction, distance: number) {
    return distance == -1 ? t("anyDistance") : distance + " km";
  }

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
        <span className="truncate">{label(t, selectedDistance)}</span>
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
        {[1, 5, 10, 20, 50, -1].map((distance) => {
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
                {label(t, distance)}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
