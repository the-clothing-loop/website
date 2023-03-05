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

export enum Distance {
  km1 = "1",
  km5 = "2",
  km10 = "3",
  km15 = "4",
  km20 = "5",
}

export const DistanceI18nKeys: Record<Distance | string, string> = {
  "1": "1 km",
  "2": "5 km",
  "3": "10 km",
  "4": "15 km",
  "5": "20 km",
};

export enum When {
  thisweek = "1",
  next2weeks = "2",
  thismonth = "3",
  next3months = "4",
}

export const WhenI18nKeys: Record<When | string, string> = {
  "1": "This week",
  "2": "Next two weeks",
  "3": "This month",
  "4": "Next three months",
};