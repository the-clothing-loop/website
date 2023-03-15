import * as React from "react";
import { useTranslation } from "react-i18next";

import { WhenI18nKeys, When } from "../api/enums";
import { useDropdownCheckBox } from "../util/dropdown.hooks";


const when = {

  [When.today]: [
    When["today"],
  ],
  [When.tomorrow]: [
    When["tomorrow"],
  ],
  [When.thisweek]: [
    When["thisweek"],
  ],
  [When.next2weeks]: [
    When["next2weeks"],
  ],
  [When.thismonth]: [
    When["thismonth"],
  ],
};


interface IProps {
  selectedDate: Array<When | string>;
  handleChange: (when: Array<When | string>) => void;
  className?: string;
}

export default function WhenDropdown({
  className,
  selectedDate,
  handleChange,
}: IProps) {
  const { t } = useTranslation();

  const dropdown = useDropdownCheckBox({
    selected: selectedDate,
    handleChange,
  });

  let btnLabel = React.useMemo(() => {
    if (selectedDate.length) {
      return [...selectedDate]
        .sort()
        .map((g) => t(WhenI18nKeys[g]))
        .join(", ");
    } else {
      // Add translation
      return "When";
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
        {Object.keys(when).map((when: string | When) => {
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
