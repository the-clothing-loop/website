const theme = {
  palette: {
    primary: {
      light: "#c0FFe2",
      main: "#067f8c",
      dark: "#068c7c",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ffe29b",
      main: "#FFC737",
      dark: "#C58C41",
      contrastText: "#fff",
    },
  },

  typography: {
    fontFamily: ["Montserrat", "sans-serif"].join(","),
  },
  body2: {
    fontSize: 0.8,
  },

  // Styling for forms
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
    fontWeight: "bold",
  },
  geocoder: {
    height: "20px",
  },


  /*styling for table*/
  root2: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 400,
  },
  input: {
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
};
export default theme;
