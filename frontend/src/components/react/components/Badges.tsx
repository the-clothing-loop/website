import type { TFunction } from "i18next";

import {
  CatI18nKeys,
  Categories,
  SizeI18nKeys,
  Sizes,
} from "../../../api/enums";
import categories from "../util/categories";
import { useTranslation } from "react-i18next";

export const SizeLetters: Record<Sizes | string, string> = {
  "1": "Baby",
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
};

export function SizeBadges({
  s,
  g,
}: {
  s?: Array<string | Sizes> | null;
  g?: Array<string | Categories> | null;
}) {
  const { t } = useTranslation();

  const children =
    s
      ?.filter((a) => categories[Categories.children].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const women =
    s
      ?.filter((a) => categories[Categories.women].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const men =
    s
      ?.filter((a) => categories[Categories.men].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];

  return (
    <ul className={`flex ${!!s ? "flex-col" : "flex-row"} items-start`}>
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
      {g?.indexOf(Categories.toys) ? (
        <SizeCatBadges
          t={t}
          key="toys"
          category={Categories.toys}
          sizes={[]}
          icon="/images/categories/toys-50.png"
          color="bg-skyBlue-light"
        />
      ) : null}
      {g?.indexOf(Categories.books) ? (
        <SizeCatBadges
          t={t}
          key="books"
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
    <div className="inline-flex flex-row mb-1 mr-1 rtl:mr-0 rtl:ml-1 rounded-full w-9 h-7 px-2 bg-orange-light"></div>
  );
}

function SizeCatBadges({
  t,
  ...props
}: {
  t: TFunction;
  category: Categories;
  sizes: Sizes[];
  icon: string;
  color: string;
}) {
  return (
    <li
      className={`inline-flex flex-row mb-1 mr-1 rtl:mr-0 rtl:ml-1 rounded-full px-2 ${props.color}`}
    >
      <div
        className="tooltip tooltip-top before:text-xs font-semibold"
        data-tip={t(CatI18nKeys[props.category as string])}
      >
        <img src={props.icon} className="h-5 my-1" />
      </div>
      <ul className="font-semibold flex flex-row text-sm cursor-default">
        {props.sizes.map((s) => {
          return (
            <li
              className="ml-1 last:mr-1 tooltip tooltip-top before:text-xs py-1"
              data-tip={t(SizeI18nKeys[s])}
              key={s}
            >
              {SizeLetters[s]}
            </li>
          );
        })}
      </ul>
    </li>
  );
}
