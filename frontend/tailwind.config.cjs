const defaultTheme = require("tailwindcss/defaultTheme");

const colors = {
  transparent: "transparent",
  white: "#ffff",
  black: "#3c3c3b",

  // aqua: "#d5ecdf",
  lightBlue: "#98d9de",
  turquoise: "#518d7e",

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
  skyBlue: {
    light: "#bfe7ef",
    DEFAULT: "#7ecfe0",
  },
  blue: {
    light: "#89b3d9",
    DEFAULT: "#1467b3",
  },
  pink: {
    light: "#ecbbd0",
    DEFAULT: "#dc77a3",
  },
  lilac: {
    light: "#dab5d6",
    DEFAULT: "#b76dac",
  },
  purple: {
    lighter: "#EADEFF",
    light: "#a899c2",
    DEFAULT: "#513484",
  },
  orange: {
    light: "#f6c99f",
    DEFAULT: "#ef953d",
  },
  leafGreen: {
    light: "#d2e2b3",
    DEFAULT: "#a6c665",
  },
  green: {
    light: "#b1c8b6",
    DEFAULT: "#66926e",
  },
  red: {
    light: "#e39aa1",
    DEFAULT: "#c73643",
  },
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
              fontWeight: 600,
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
