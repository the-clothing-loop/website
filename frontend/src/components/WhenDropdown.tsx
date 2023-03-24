import * as React from "react";
import { useTranslation } from "react-i18next";

import { WhenI18nKeys, When } from "../api/enums";
import { useDropdownRadio } from "../util/dropdown.hooks";

interface IProps {
  selectedDate: When | string;
  handleChange: (when: When | string) => void;
  className?: string;
}

export default function WhenDropdown({
  className,
  selectedDate,
  handleChange,
}: IProps) {
  const { t } = useTranslation();

  const dropdown = useDropdownRadio({
    selected: selectedDate,
    handleChange,
  });

  let btnLabel = React.useMemo(() => {
    if (selectedDate.length) {
      return [selectedDate].map((g) => t(WhenI18nKeys[g]));
    } else {
      return t("when");
    }
  }, [t, selectedDate]);

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
        {Object.keys(WhenI18nKeys).map((when: string | When) => {
          let checked = selectedDate.includes(when);
          return (
            <li key={when}>
              <label>
                <input
                  name="when"
                  type="checkbox"
                  checked={checked}
                  className="checkbox"
                  onChange={() => dropdown.change(when)}
                />
                {t(WhenI18nKeys[when])}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
