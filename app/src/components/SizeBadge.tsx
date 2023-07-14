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
    <IonBadge
      color="light"
      style={{ flexDirection: "row-reverse", display: "flex" }}
    >
      <IonImg
        src={`/categories/${icon}-50.png`}
        style={{
          width: 16,
          height: 16,
        }}
      />
      {sizes.map((s) => (
        <span style={{ margin: 2 }} key={s}>
          {SizeLetters[s]}
        </span>
      ))}
    </IonBadge>
  );
}

export default function Badges({ chain }: { chain: Chain }) {
  const children =
    chain.sizes
      ?.filter((a) => categories[Genders.children].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const women =
    chain.sizes
      ?.filter((a) => categories[Genders.women].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];
  const men =
    chain.sizes
      ?.filter((a) => categories[Genders.men].includes(a as Sizes))
      .sort((a, z) => a.localeCompare(z)) || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
      }}
    >
      {women?.length || chain.genders?.includes(Genders.women) ? (
        <BadgeItem sizes={women} icon="man" key="women" />
      ) : null}
      {men?.length || chain.genders?.includes(Genders.men) ? (
        <BadgeItem sizes={men} icon="woman" key="men" />
      ) : null}
      {children?.length || chain.genders?.includes(Genders.children) ? (
        <BadgeItem sizes={children} icon="baby" key="children" />
      ) : null}
    </div>
  );
}
