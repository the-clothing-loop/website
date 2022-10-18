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

export const SizeI18nKeys: Record<Sizes | string, string> = {
  "1": "baby",
  "2": "1To4YearsOld",
  "3": "5To12YearsOld",
  "4": "womenSmall",
  "5": "womenMedium",
  "6": "womenLarge",
  "7": "womenPlusSize",
  "8": "menSmall",
  "9": "menMedium",
  A: "menLarge",
  B: "menPlusSize",
};

export enum Genders {
  children = "1",
  women = "2",
  men = "3",
}

export const GenderI18nKeys: Record<Genders | string, string> = {
  "1": "children",
  "2": "women",
  "3": "men",
};
