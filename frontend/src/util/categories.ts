interface ICategories {
  [key: string]: string[];
}

const clothingCategories: ICategories = {
  children: ["baby", "1To4YearsOld", "5To12YearsOld"],
  women: ["womenSmall", "womenMedium", "womenLarge"],
  men: ["menSmall", "menMedium", "menLarge"],
};

export const allSizes = Object.values(clothingCategories).reduce(
  (prev, current) => prev.concat(current)
);

export default clothingCategories;
