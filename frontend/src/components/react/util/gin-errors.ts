import type { TFunction } from "i18next";

const regx = /Key: '((\w+\.)?(\w+))'/g;
export function GinParseErrors(
  t: TFunction<"translation", undefined>,
  e: string | { data: string } | any,
): string {
  if (typeof e === "string") {
    return e !== "" ? e : t("genericError", { ns: "translation" });
  }
  if (e?.data && typeof e.data === "string") {
    let m = e.data.matchAll(regx);
    let res = Array.from(m) as string[];
    let errs = res.map((a) => a[3] || "");

    if (!errs.length) {
      return e.data;
    }

    return t("required", { ns: "translation" }) + ": " + errs.join(", ");
  }

  return (
    t("genericError", { ns: "translation" }) +
    ": " +
    JSON.stringify(e?.data || e?.message || e?.statusText || e)
  );
}
