import { TFunction } from "react-i18next";
import { GenderI18nKeys, Genders, SizeI18nKeys, Sizes } from "../api/enums";

export function GenderBadges(t: TFunction, arr: Array<string | Genders>) {
  return arr.map((g) => (
    <span className="badge badge-outline mr-2" key={g}>
      {t(GenderI18nKeys[g])}
    </span>
  ));
}

export const SizeLetters: Record<Sizes | string, string> = {
  "1": "Baby",
  "2": "<4",
  "3": "5-12",
  "4": "S",
  "5": "M",
  "6": "L",
  "7": "+",
  "8": "S",
  "9": "M",
  A: "L",
  B: "+",
};

export function SizeBadges(t: TFunction, arr: Array<string | Sizes>) {
  return arr.map((s) => (
    <span
      className="badge badge-outline mr-2 tooltip tooltip-top"
      key={s}
      data-tip={t(SizeI18nKeys[s])}
    >
      {SizeLetters[s]}
    </span>
  ));
}
