import { Genders, Sizes } from "../api/enums";

type ICategories = Record<Genders, Sizes[]>;

const clothingCategories: ICategories = {
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

export const allSizes = Object.values(clothingCategories).reduce(
  (prev, current) => prev.concat(current)
);

export default clothingCategories;
