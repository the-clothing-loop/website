import { useTranslation } from "react-i18next";
import { Genders, Sizes } from "../api/enums";
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
  s: Array<string | Sizes>;
  g?: Array<string | Genders>;
}) {
  const { t } = useTranslation();

  const children = s
    .filter((a) => categories[Genders.children].includes(a as Sizes))
    .sort((a, z) => a.localeCompare(z));
  const women = s
    .filter((a) => categories[Genders.women].includes(a as Sizes))
    .sort((a, z) => a.localeCompare(z));
  const men = s
    .filter((a) => categories[Genders.men].includes(a as Sizes))
    .sort((a, z) => a.localeCompare(z));

  return (
    <ul className="flex flex-col items-start">
      {women.length || g?.includes(Genders.women) ? (
        <SizeCatBadges
          key="women"
          gender={Genders.women}
          sizes={women as Sizes[]}
          icon="/images/categories/woman-50.png"
          color="bg-orange-light"
        />
      ) : null}
      {men.length || g?.includes(Genders.men) ? (
        <SizeCatBadges
          key="men"
          gender={Genders.men}
          sizes={men as Sizes[]}
          icon="/images/categories/man-50.png"
          color="bg-purple-lighter"
        />
      ) : null}
      {children.length || g?.includes(Genders.children) ? (
        <SizeCatBadges
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
// <span
//   className="badge badge-outline text-xs tracking-widest bg-white px-1.5 mr-2 rtl:first:mr-0 tooltip tooltip-top"
//   key={s}
//   data-tip={t(SizeI18nKeys[s])}
// >
//   {SizeLetters[s]}
// </span>

function SizeCatBadges(props: {
  gender: Genders;
  sizes: Sizes[];
  icon: string;
  color: string;
}) {
  return (
    <li
      className={
        "inline-flex flex-row mb-1 rounded-full py-1 px-2 " + props.color
      }
    >
      <img src={props.icon} className="h-5" />
      <ul className="font-semibold flex flex-row text-sm">
        {props.sizes.map((s) => {
          return (
            <li className="ml-1 last:mr-1" key={s}>
              {SizeLetters[s]}
            </li>
          );
        })}
      </ul>
    </li>
  );
}
