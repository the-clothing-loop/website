import type { TFunction } from "i18next";

import {
  CatI18nKeys,
  Categories,
  SizeI18nKeys,
  Sizes,
} from "../../../api/enums";
import { nonBabyClothingCategories as categories } from "../util/categories";
import { useTranslation } from "react-i18next";

export const SizeLetters: (t: TFunction) => Record<Sizes | string, string> = (
  t,
) => ({
  "1": t("baby"),
  "2": "≤4",
  "3": "5-12",
  "4": "(X)S",
  "5": "M",
  "6": "(X)L",
  "7": "XL≤",
  "8": "(X)S",
  "9": "M",
  A: "(X)L",
  B: "XL≤",
  C: t("womenMaternity"),
  D: t("teenGirls"),
  E: t("teenBoys"),
});

export function SizeBadges({
  s,
  g,
  categoryOnly,
}: {
  s?: Array<string | Sizes> | null;
  g?: Array<string | Categories> | null;
  categoryOnly?: boolean;
}) {
  const { t } = useTranslation();

  let children: string[] = [];
  let women: string[] = [];
  let men: string[] = [];
  if (!categoryOnly) {
    children =
      s
        ?.filter((a) => categories[Categories.children].includes(a as Sizes))
        .sort((a, z) => a.localeCompare(z)) || [];
    women =
      s
        ?.filter((a) => categories[Categories.women].includes(a as Sizes))
        .sort((a, z) => a.localeCompare(z)) || [];

    men =
      s
        ?.filter((a) => categories[Categories.men].includes(a as Sizes))
        .sort((a, z) => a.localeCompare(z)) || [];
  }
  return (
    <ul className={`flex ${!!s ? "flex-col" : "flex-row"} items-start gap-1`}>
      {women.length || g?.includes(Categories.women) ? (
        <SizeCatBadges
          t={t}
          key="women"
          category={Categories.women}
          sizes={women as Sizes[]}
          icon="/images/categories/woman-50.png"
          color="bg-orange-light"
        />
      ) : null}
      {men.length || g?.includes(Categories.men) ? (
        <SizeCatBadges
          t={t}
          key="men"
          category={Categories.men}
          sizes={men as Sizes[]}
          icon="/images/categories/man-50.png"
          color="bg-purple-lighter"
        />
      ) : null}
      {children.length || g?.includes(Categories.children) ? (
        <SizeCatBadges
          t={t}
          key="children"
          category={Categories.children}
          sizes={children as Sizes[]}
          icon="/images/categories/baby-50.png"
          color="bg-leafGreen-light"
        />
      ) : null}
      {g?.includes(Categories.toys) ? (
        <SizeCatBadges
          t={t}
          key="toys"
          text={categoryOnly ? undefined : (t("toys") as string)}
          category={Categories.toys}
          sizes={[]}
          icon="/images/categories/toys-50.png"
          color="bg-skyBlue-light"
        />
      ) : null}
      {g?.includes(Categories.books) ? (
        <SizeCatBadges
          t={t}
          key="books"
          text={categoryOnly ? undefined : (t("books") as string)}
          category={Categories.books}
          sizes={[]}
          icon="/images/categories/books-50.png"
          color="bg-pink-light"
        />
      ) : null}
    </ul>
  );
}

export function SizeBadgeLoading() {
  return (
    <div className="inline-flex flex-row rounded-full w-9 h-7 px-2 bg-orange-light"></div>
  );
}

function SizeCatBadges({
  t,
  ...props
}: {
  t: TFunction;
  category: Categories;
  sizes: Sizes[];
  text?: string;
  icon: string;
  color: string;
}) {
  const sizeLetters = SizeLetters(t);
  const tooltipClass = props.text ? "" : "tooltip tooltip-top before:text-xs";
  const tooltipText = props.text
    ? undefined
    : t(CatI18nKeys[props.category as string]);
  return (
    <li
      className={`inline-flex flex-row mb-1 me-1 rounded-[14px] px-2 ${props.color}`}
    >
      <div
        className={`flex-shrink-0 ${tooltipClass} font-semibold`}
        data-tip={tooltipText}
      >
        <img src={props.icon} className="h-5 my-1" />
      </div>
      <ul className="font-semibold flex flex-row flex-shrink flex-wrap text-sm cursor-default">
        {props.text ? (
          <li key="text" className="ml-1 py-1 whitespace-nowrap">
            {props.text}
          </li>
        ) : null}
        {props.sizes.map((s) => {
          return (
            <li
              className="ml-1 last:mr-1 tooltip tooltip-top before:text-xs py-1"
              data-tip={t(SizeI18nKeys[s])}
              key={s}
            >
              {sizeLetters[s]}
            </li>
          );
        })}
      </ul>
    </li>
  );
}

export function BadgesEventInstagram(genders: string[]) {
  return genders?.map((gender) => {
    let src = "";
    let alt = "";
    switch (gender) {
      case Categories.children:
        src = "/images/categories/baby-50.png";
        alt = "Baby";
        break;
      case Categories.women:
        src = "/images/categories/woman-50.png";
        alt = "Woman";
        break;
      case Categories.men:
        alt = "Men";
        src = "/images/categories/man-50.png";
        break;
      case Categories.toys:
        alt = "Toys";
        src = "/images/categories/toys-50.png";
        break;
      case Categories.books:
        alt = "Books";
        src = "/images/categories/books-50.png";
    }
    return (
      <div className="h-9 p-1 relative">
        <div className="absolute inset-0 rounded-full bg-white" />
        <img
          key={gender}
          src={src}
          alt={alt}
          className="relative z-10 h-full"
        />
      </div>
    );
  });
}
