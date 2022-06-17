# Frontend Documentation

## Styling

### MUI Material framework

[MUI](https://mui.com/) is used for Components using a specified theme ([file](/src/util/theme.ts)) global alterations are made using MUI's theme API (docs: [components](https://mui.com/material-ui/customization/theme-components/) [theme object](https://mui.com/material-ui/customization/default-theme/)).

### TailwindCSS for specific styling

Motive behind moving to tailwind is to decrease the bundle size of the website [Tailwind CSS vs. CSS: An in-depth comparison (speed, file size, etc.)](https://www.programonaut.com/tailwind-css-vs-css-an-in-depth-comparison-speed-file-size-etc/)

Component specific styling uses [TailwindCSS](https://tailwindcss.com/).

The `tw-` prefix is used to differenciate between tailwind classes and legacy css or mui classes [docs](https://tailwindcss.com/docs/configuration#prefix).

> To get Tailwind working with CreateReactApp I needed to add `craco` a "Create React App Configuration Override, an easy and comprehensible configuration layer for create-react-app". `craco` can be removed during the move to NextJS.
