interface ICategories {
  [key: string]: string[];
}

const clothingCategories: ICategories = {
  children: ["baby", "1To4YearsOld", "5To12YearsOld"],
  women: ["EU36", "EU38", "EU40", "womenPlusSize"],
  men: ["EU46", "EU48", "EU50", "menPlusSize"],
};

export const allSizes = Object.values(clothingCategories).reduce(
  (prev, current) => prev.concat(current)
);

export default clothingCategories;
