const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  prefix: "tw-",
  important: "#root",
  theme: {
    screens: {
      xs: "481px",
      sm: "600px",
      md: "900px",
      lg: "1200px",
      xl: "1536px",
    },
    colors: {
      transparent: "transparent",
      white: "#ffff",
      black: "#3C3C3B",
      teal: {
        light: "#D5ECDF",
        DEFAULT: "#48808B",
      },
      yellow: "#F7C86F",
      // aqua: "#D5ECDF",
      lightBlue: "#98D9DE",
      turquoise: "#518D7E",
      bronze: "#C58C41",
      grey: {
        light: "#e8e8e8",
        DEFAULT: "#A5A5A5",
      },
    },
    fontFamily: {
      sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
      serif: ["Playfair Display", ...defaultTheme.fontFamily.serif],
    },
    extend: {},
  },
  plugins: [],
  corePlugins: { preflight: false },
};
