interface ICategories {
  [key: string]: string[]
}

const clothingCategories: ICategories = {
  children: [
    "baby",
    "1-4 years old",
    "5-12 years old",
  ],
  women: [
    "EU36",
    "EU38",
    "EU40",
    "Women's plus size",
  ],
  men: [
    "EU46",
    "EU48",
    "EU50",
    "Men's plus size",
  ],
};

export const allSizes = Object.values(clothingCategories).reduce(
  (prev, current) => (prev.concat(current))
);

export default clothingCategories;