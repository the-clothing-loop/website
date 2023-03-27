import dayjs from "../util/dayjs";
import { TFunction, i18n } from "i18next";

export default function simplifyDays(
  t: TFunction,
  i18n: i18n,
  date: string
): string {
  const numDays = dayjs().diff(dayjs(date), "days");

  if (numDays < 1) {
    return t("new");
  } else if (numDays < 7) {
    return t("nDays", { n: numDays });
  } else {
    let locale = i18n.language;
    if (locale === "en") locale = "default";

    return new Date(date).toLocaleDateString(locale);
  }
}
