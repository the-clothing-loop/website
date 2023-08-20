import { IonBadge, IonIcon, IonImg } from "@ionic/react";
import { Chain } from "../api";

type ICategories = Record<Genders, Sizes[]>;

export enum Genders {
  children = "1",
  women = "2",
  men = "3",
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
}
const categories: ICategories = {
  [Genders.children]: [
    Sizes["baby"],
    Sizes["1To4YearsOld"],
    Sizes["5To12YearsOld"],
  ],
  [Genders.women]: [
    Sizes["womenSmall"],
    Sizes["womenMedium"],
    Sizes["womenLarge"],
    Sizes["womenPlusSize"],
  ],
  [Genders.men]: [
    Sizes["menSmall"],
    Sizes["menMedium"],
    Sizes["menLarge"],
    Sizes["menPlusSize"],
  ],
};
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
function BadgeItem({ sizes, icon }: { sizes: string[]; icon: string }) {
  return (
    <IonBadge color="light" className="tw-flex-row-reverse tw-flex">
      <IonImg
        src={`/categories/${icon}-50.png`}
        className="dark:tw-invert-1 tw-w-4 tw-h-4"
      />
      {sizes.map((s) => (
        <span className="tw-m-0.5" key={s}>
          {SizeLetters[s]}
        </span>
      ))}
    </IonBadge>
  );
}

export default function Badges(props: {
  sizes: string[] | null;
  genders: string[] | null;
}) {
  const children =
    props.sizes
      ?.filter((a) => categories[Genders.children].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const women =
    props.sizes
      ?.filter((a) => categories[Genders.women].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const men =
    props.sizes
      ?.filter((a) => categories[Genders.men].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];

  return (
    <div className="tw-flex tw-flex-col tw-items-end tw-gap-1">
      {women?.length || props.genders?.includes(Genders.women) ? (
        <BadgeItem sizes={women} icon="woman" key="women" />
      ) : null}
      {men?.length || props.genders?.includes(Genders.men) ? (
        <BadgeItem sizes={men} icon="man" key="men" />
      ) : null}
      {children?.length || props.genders?.includes(Genders.children) ? (
        <BadgeItem sizes={children} icon="baby" key="children" />
      ) : null}
    </div>
  );
}
