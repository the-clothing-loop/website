import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { GenderI18nKeys, Genders, SizeI18nKeys, Sizes } from "../api/enums";
import categories from "../util/categories";

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
  g?: Array<string | Genders> | null;
}) {
  const { t } = useTranslation();

  const children =
    s
      ?.filter((a) => categories[Genders.children].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const women =
    s
      ?.filter((a) => categories[Genders.women].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const men =
    s
      ?.filter((a) => categories[Genders.men].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];

  return (
    <ul className={`flex ${!!s ? "flex-col" : "flex-row"} items-start`}>
      {women?.length || g?.includes(Genders.women) ? (
        <SizeCatBadges
          t={t}
          key="women"
          gender={Genders.women}
          sizes={women as Sizes[]}
          icon="/images/categories/woman-50.png"
          color="bg-orange-light"
        />
      ) : null}
      {men?.length || g?.includes(Genders.men) ? (
        <SizeCatBadges
          t={t}
          key="men"
          gender={Genders.men}
          sizes={men as Sizes[]}
          icon="/images/categories/man-50.png"
          color="bg-purple-lighter"
        />
      ) : null}
      {children?.length || g?.includes(Genders.children) ? (
        <SizeCatBadges
          t={t}
          key="children"
          gender={Genders.children}
          sizes={children as Sizes[]}
          icon="/images/categories/baby-50.png"
          color="bg-leafGreen-light"
        />
      ) : null}
    </ul>
  );
}

function SizeCatBadges({
  t,
  ...props
}: {
  t: TFunction;
  gender: Genders;
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
        data-tip={t(GenderI18nKeys[props.gender as string])}
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
