import { IonBadge, IonImg } from "@ionic/react";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type ICategories = Record<Categories, Sizes[]>;

export enum Categories {
  children = "1",
  women = "2",
  men = "3",
  toys = "4",
  books = "5",
}
export enum Sizes {
  baby = "1",
  "1To4YearsOld" = "2",
  "5To12YearsOld" = "3",
  womenSmall = "4",
  womenMedium = "5",
  womenLarge = "6",
  womenPlusSize = "7",
  menSmall = "8",
  menMedium = "9",
  menLarge = "A",
  menPlusSize = "B",
  womenMaternity = "C",
}
const categories: ICategories = {
  [Categories.children]: [
    Sizes["baby"],
    Sizes["1To4YearsOld"],
    Sizes["5To12YearsOld"],
  ],
  [Categories.women]: [
    Sizes["womenSmall"],
    Sizes["womenMedium"],
    Sizes["womenLarge"],
    Sizes["womenPlusSize"],
    Sizes["womenMaternity"],
  ],
  [Categories.men]: [
    Sizes["menSmall"],
    Sizes["menMedium"],
    Sizes["menLarge"],
    Sizes["menPlusSize"],
  ],
  [Categories.toys]: [],
  [Categories.books]: [],
};
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
});
function BadgeItem({
  sizes,
  icon,
  t,
}: {
  sizes: string[];
  icon: string;
  t: TFunction;
}) {
  const sizeLetters = SizeLetters(t);
  return (
    <IonBadge color="light" className="tw-flex-row tw-flex">
      <div className="tw-flex tw-flex-row tw-flex-wrap tw-justify-end tw-max-w-[120px]">
        {sizes.map((s) => (
          <span className="tw-m-0.5" key={s}>
            {sizeLetters[s]}
          </span>
        ))}
      </div>
      <IonImg
        src={`/categories/${icon}-50.png`}
        className="dark:tw-invert-1 tw-w-4 tw-h-4"
      />
    </IonBadge>
  );
}
function BadgeItemSingle({ icon, text }: { icon: string; text: string }) {
  return (
    <IonBadge color="light" className="tw-flex-row tw-flex">
      {text ? (
        <span className="tw-m-0.5 tw-me-1" key="text">
          {text}
        </span>
      ) : null}
      <IonImg
        src={`/categories/${icon}-50.png`}
        className="dark:tw-invert-1 tw-w-4 tw-h-4"
      />
    </IonBadge>
  );
}

export default function Badges(props: {
  sizes: string[] | null;
  categories: string[] | null;
}) {
  const { t } = useTranslation();
  const children =
    props.sizes
      ?.filter((a) => categories[Categories.children].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const women =
    props.sizes
      ?.filter((a) => categories[Categories.women].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const men =
    props.sizes
      ?.filter((a) => categories[Categories.men].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];

  return (
    <div className="tw-flex tw-flex-col tw-items-end tw-gap-1">
      {women?.length || props.categories?.includes(Categories.women) ? (
        <BadgeItem t={t} sizes={women} icon="woman" key="women" />
      ) : null}
      {men?.length || props.categories?.includes(Categories.men) ? (
        <BadgeItem t={t} sizes={men} icon="man" key="men" />
      ) : null}
      {children?.length || props.categories?.includes(Categories.children) ? (
        <BadgeItem t={t} sizes={children} icon="baby" key="children" />
      ) : null}
      {props.categories?.includes(Categories.toys) ? (
        <BadgeItemSingle text={t("toys")} icon="toys" key="toys" />
      ) : null}
      {props.categories?.includes(Categories.books) ? (
        <BadgeItemSingle text={t("books")} icon="books" key="books" />
      ) : null}
    </div>
  );
}
