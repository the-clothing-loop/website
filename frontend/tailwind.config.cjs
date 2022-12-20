const defaultTheme = require("tailwindcss/defaultTheme");

const colors = {
  transparent: "transparent",
  white: "#ffff",
  black: "#3C3C3B",
  teal: {
    light: "#ecf2f3",
    DEFAULT: "#48808B",
  },
  yellow: {
    DEFAULT: "#f7c86f",
    dark: "#F4B63F",
    darker: "#F1A40F",
    darkest: "#C58C41",
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
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "481px",
      sm: "600px",
      md: "900px",
      lg: "1200px",
      xl: "1536px",
    },
    colors,
    fontFamily: {
      sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
      serif: ["Playfair Display", ...defaultTheme.fontFamily.serif],
    },
    extend: {
      keyframes: {
        slide: {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: `translateX(-${1213 * 2}px)`,
          },
        },
        "slide-small": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: `translateX(-${909 * 2}px)`,
          },
        },
        "spin-half": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(180deg)",
          },
        },
      },
      animation: {
        slide: "30s linear 0s slide infinite",
        "slide-small": "30s linear 0s slide-small infinite",
      },
      typography: {
        DEFAULT: {
          css: {
            color: colors.black,
          },
        },
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: colors.yellow.DEFAULT,
          "primary-focus": colors.yellow.darker,
          secondary: colors.teal.DEFAULT,
          "secondary-focus": colors.black,
          accent: colors.turquoise,
          "accent-focus": colors.black,
          neutral: colors.black,
          "base-100": colors.white,
          "base-200": colors.grey.light,
          "base-300": colors.grey.DEFAULT,
          "base-content": colors.black,
        },
      },
    ],
  },
};
