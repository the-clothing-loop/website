# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Commands

In the project directory, you can run:

### Run the app in the development mode

This opens [http://localhost:3000](http://localhost:3000) automatically in your default browser.

The page will reload if you make edits.
You will also see any errors in the console.

`npm run start`

### Build the app for production to the `build` folder

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

`npm run build`

### Lint

[Prettier](https://prettier.io/) is used as linter.
Please install the prettier addon to your preferred editor and ensure that you lint before you save or commit.

Tests using Prettier if the code is styled correctly.

`npm run lint:test`

Tries to fix any missing spaces or tabs required by Prettier

`npm run lint`

## Styling

### MUI Material framework

[MUI](https://mui.com/) is used for Components using a specified theme ([file](/src/util/theme.ts)) global alterations are made using MUI's theme API (docs: [components](https://mui.com/material-ui/customization/theme-components/) [theme object](https://mui.com/material-ui/customization/default-theme/)).

This is to be phased out.

### TailwindCSS for specific styling

Motive behind moving to tailwind is to decrease the bundle size of the website [Tailwind CSS vs. CSS: An in-depth comparison (speed, file size, etc.)](https://www.programonaut.com/tailwind-css-vs-css-an-in-depth-comparison-speed-file-size-etc/)

Component specific styling uses [TailwindCSS](https://tailwindcss.com/).
