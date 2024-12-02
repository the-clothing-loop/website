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
  teenGirls = "D",
  teenBoys = "E",
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
  C: "womenMaternity",
  D: "teenGirls",
  E: "teenBoys",
};

export enum Categories {
  children = "1",
  women = "2",
  men = "3",
  toys = "4",
  books = "5",
}

export const CatI18nKeys: Record<Categories | string, string> = {
  "1": "children",
  "2": "women",
  "3": "men",
  "4": "toys",
  "5": "books",
};
export enum ReasonsForLeaving {
  moved = "1",
  notEnoughItemsILiked = "2",
  addressTooFar = "3",
  tooTimeConsuming = "4",
  doneSwapping = "5",
  didntFitIn = "6",
  other = "7",
  planToJoinNewLoop = "8",
  planToStartNewLoop = "9",
  dontPlanToParticipate = "10",
  qualityDidntMatch = "11",
  sizesDidntMatch = "12",
  stylesDidntMatch = "13",
}

export const ReasonsForLeavingI18nKeys: Record<
  ReasonsForLeaving | string,
  string
> = {
  "1": "moved",
  "2": "notEnoughItemsILiked",
  "3": "addressTooFar",
  "4": "tooTimeConsuming",
  "5": "doneSwapping",
  "6": "didntFitIn",
  "7": "other",
  "8": "planToJoinNewLoop",
  "9": "planToStartNewLoop",
  "10": "dontPlanToParticipate",
  "11": "qualityDidntMatch",
  "12": "sizesDidntMatch",
  "13": "stylesDidntMatch",
};
