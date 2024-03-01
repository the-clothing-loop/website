# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Commands

In the project directory, you can run:

### Run the app in the development mode

The page will reload if you make edits.
You will also see any errors in the console.

`npm run start`

Then open [http://localhost:3000](http://localhost:3000) on your preferred browser.

### Test the app on your phone

1. Run `npm run start:lan`
2. Open port `3000` on your pc
3. Figure out what LAN IP your pc is at generally starts with `192.168.x.x`
4. Open your pc LAN IP on your phone e.g. `http://192.168.1.68:3000/`

### Build the app for production to the `build` folder

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

`npm run build`

### Lint

[Prettier](https://prettier.io/) is used as linter.
Please install the prettier addon to your preferred editor and ensure that you lint before you save or commit.

Tests using Prettier if the code is styled correctly.

`npm run lint:test`

Tries to fix any missing spaces or tabs required by Prettier

`npm run lint`

## Libraries

### TailwindCSS

Motive behind moving to tailwind is to decrease the bundle size of the website [Tailwind CSS vs. CSS: An in-depth comparison (speed, file size, etc.)](https://www.programonaut.com/tailwind-css-vs-css-an-in-depth-comparison-speed-file-size-etc/)

### Flags

Flag icons come from: https://flagicons.lipis.dev/
[MIT LICENSE](https://github.com/lipis/flag-icons/blob/main/LICENSE)

### Icons

Icons on this website uses https://feathericons.com/
[MIT LICENSE](https://github.com/feathericons/feather/blob/master/LICENSE)
