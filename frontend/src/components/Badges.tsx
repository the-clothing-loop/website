import { TFunction } from "react-i18next";
import { GenderI18nKeys, Genders, SizeI18nKeys, Sizes } from "../api/enums";

export function GenderBadges(t: TFunction, arr: Array<string | Genders>) {
  return arr.map((g) => (
    <span className="tw-badge tw-badge-outline tw-mr-2" key={g}>
      {t(GenderI18nKeys[g])}
    </span>
  ));
}

export function SizeBadges(t: TFunction, arr: Array<string | Sizes>) {
  return arr.map((s) => (
    <span className="tw-badge tw-badge-outline tw-mr-2" key={s}>
      {t(SizeI18nKeys[s])}
    </span>
  ));
}
