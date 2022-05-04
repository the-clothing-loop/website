interface ICategories {
  [key: string]: string[];
}

const clothingCategories: ICategories = {
  children: ["baby", "1To4YearsOld", "5To12YearsOld"],
  women: ["(extra)Small", "medium", "(extra)Large", "womenPlusSize"],
  men: ["(extra)Small", "medium", "(extra)Large", "menPlusSize"],
};

export const allSizes = Object.values(clothingCategories).reduce(
  (prev, current) => prev.concat(current)
);

export default clothingCategories;
