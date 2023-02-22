const defaultTheme = require("tailwindcss/defaultTheme");

const colors = {
  transparent: "transparent",
  white: "#ffff",
  black: "#3c3c3b",
  teal: {
    light: "#ecf2f3",
    DEFAULT: "#48808b",
  },
  yellow: {
    DEFAULT: "#f7c86f",
    dark: "#f4b63f",
    darker: "#f1a40f",
    darkest: "#c58c41",
  },
  // aqua: "#d5ecdf",
  lightBlue: "#98d9de",
  turquoise: "#518d7e",
  green: "#4caf50",
  red: "#ef5350",
  grey: {
    light: "#e8e8e8",
    DEFAULT: "#a5a5a5",
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: ["list-none"],
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
        "max-h": {
          from: {
            maxHeight: "0px",
          },
          to: {
            maxHeight: "400px",
          },
        },
        slide: {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: `translateX(-${1213 * 2}px)`,
          },
        },
        "slide-small": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: `translateX(-${909 * 2}px)`,
          },
        },
        "spin-quarter": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(90deg)",
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
            "strong, b": {
              fontWeight: 500,
            },
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
