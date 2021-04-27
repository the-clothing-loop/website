const theme = {
  palette: {
    primary: {
      light: "#cce9f1",
      main: "#5cE1E6",
      dark: "#067f8c",
      contrastText: "#fff",
    },
    secondary: {
      light: "#e5e0f1",
      main: "#bf7cbc",
      dark: "#c2264b",
      contrastText: "#fff",
    },
  },

  // Styling for forms
  form: {
    typography: {
      useNextVariants: true,
    },
    form: {
      textAlign: "center",
    },
    image: {
      margin: "20px auto auto auto",
    },
    pageTitle: {
      margin: "20px auto 20px auto",
    },
    textField: {
      margin: "10px auto 10px auto",
    },
    button: {
      margin: "10px 10px 10px 10px",
    },
    root: {
      minWidth: 275,
    },
    title: {
      fontSize: 10,
      textTransform: "uppercase",
      fontWeight: 'bold',
    },
    geocoder: {
      height: "20px",
    }
  },
};

export default theme;
