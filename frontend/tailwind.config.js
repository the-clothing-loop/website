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
      yellow: {
        DEFAULT: "#f7c86f",
        dark: "#F4B63F",
        darker: "#F1A40F",
      },
      // aqua: "#D5ECDF",
      lightBlue: "#98D9DE",
      turquoise: "#518D7E",
      green: "#4CAF50",
      red: "#EF5350",
      grey: {
        light: "#e8e8e8",
        DEFAULT: "#A5A5A5",
      },
    },
    fontFamily: {
      sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
      serif: ["Playfair Display", ...defaultTheme.fontFamily.serif],
    },
    extend: {
      keyframes: {
        slide: {
          "0%": {
            left: "0%",
          },
          "50%": {
            left: "-100%",
          },
          "100%": {
            left: "-200%",
          },
        },
      },
      animation: {
        slide: "8s slide infinite",
      },
    },
  },
  plugins: [],
  corePlugins: { preflight: false },
};
