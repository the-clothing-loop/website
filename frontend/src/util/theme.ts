import { findByLabelText } from "@testing-library/dom";
import { url } from "inspector";

const black = "#3C3C3B";
const white = "#ffff";
const teal = "#48808B";
const yellow = "#F7C86F";
const aqua = " #D5ECDF";
const lightBlue = "#98D9DE";
const turquoise = "#518D7E";
const bronze = "#C58C41";
const grey = "#A5A5A5";

const font = ["Montserrat", "sans-serif"].join(",");

const theme = {
  palette: {
    primary: {
      light: aqua,
      main: yellow,
      dark: teal,
      contrastText: white,
    },
    secondary: {
      light: aqua,
      main: turquoise,
      dark: bronze,
      contrastText: black,
    },
  },

  typography: {
    fontFamily: font,
  },
  body2: {
    fontSize: 0.8,
  },
  p: {
    fontSize: "0.875rem",
  },
  a: {
    color: bronze,
    display: "inline",
    fontSize: "0.875rem",
    textDecoration: "underline",
    padding: "0 3px",
  },

  em: {
    color: "#5e636e",
    fontStyle: "inherit",
    float: "left",
    fontWeight: "400",
    fontSize: "1rem",
    lineHeight: "1.4375em",
    letterSpacing: " 0.00938em",
    fontFamily: font,
  },

  header: {
    backgroundColor: teal,
    boxShadow: "none",
    display: "flex",
    justifyContent: " flex-end",
    flexDirection: "row",
    alignItems: "center",
    zIndex: "1111",

    "& div.language-switcher-wrapper": {
      paddingRight: "2%",
      "& div#simple-select": {
        textTransform: "uppercase",
      },
    },
  },

  buttonContained: {
    position: "relative",
    width: "100%",
    margin: "15px 15px 15px 15px",
    backgroundColor: yellow,
    color: "#fff",
  },

  buttonOutlined: {
    position: "relative",
    margin: "15px 15px 15px 15px",
    width: "100%",
    border: `1px solid ${yellow}`,
    color: "black",
  },

  submitBtn: {
    alignSelf: "stretch",
    margin: "1%",

    "&:hover": {
      backgroundColor: bronze,
      color: black,
    },
  },

  buttonCta: {
    backgroundColor: turquoise,
    color: yellow,
    border: `1px solid ${bronze}`,
  },

  menuItem: {
    textTransform: "uppercase",
  },

  // Styling for forms
  form: {
    textAlign: "center",
    backgroundColor: aqua,
  },
  formContainer: {
    padding: " 5%",
  },
  image: {
    margin: "20px auto auto auto",
  },
  pageTitle: {
    margin: "20px auto 20px auto",
    fontFamily: font,
    fontSize: "1.5rem",
  },
  loopName: {
    fontFamily: font,
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "2rem ",
  },
  textField: {
    margin: "5px auto 5px auto",
    border: "none",
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
  card: {
    minWidth: "400px",
    backgroundColor: aqua,
  },
  cardContent: {
    "& h1": {
      fontSize: "2rem",
      textTransform: "uppercase",
      fontWeight: "bolder",
    },

    "& h2": {
      fontSize: "1.1rem",
      padding: "2% 0",
    },

    "& h3": {
      fontSize: "1rem",
      padding: "3%",
      textTransform: "uppercase",
      display: "flex",
    },

    "& p": {
      color: turquoise,
      fontSize: "0.8rem",
    },

    "& div#categories-container, div#sizes-container": {
      display: "flex",
      flexWrap: "wrap",
    },
  },
  geocoder: {
    height: "20px",
  },

  /*styling for table*/
  root2: {
    backgroundColor: teal,
    alignItems: "center",
    borderRadius: "0px",
    display: "flex",
    width: "100%",
    justifyContent: "center",
    zIndex: "1100",
    position: "relative",
    boxShadow:
      "0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important",
  },

  checkbox: {
    color: `${yellow} !important`,
  },

  actionsWrapper: {
    display: "flex",
  },

  input: {
    margin: "1% !important",
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "1% 50%",
    backgroundSize: "35px 35px",
    backgroundColor: "#fff",
    minWidth: "30rem",
    width: "30rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    minHeight: "1.4375em",
    borderRadius: "4px",
    padding: " 0 1%",
    border: "0",
    fontFamily: font,
    boxShadow:
      "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",

    "& input.css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input": {
      padding: "10px !important",
      fontFamily: font,
      marginLeft: "30px !important",
    },

    "& .css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input": {
      textTransform: "capitalize",
    },
  },

  iconButton: {
    padding: 10,
  },

  select: {
    backgroundColor: "#fff",
    width: "15rem",
    boxShadow:
      "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",

    "& div#demo-multiple-checkbox": {
      padding: "10px !important",
    },
  },

  simpleSelect: {
    textTransform: "uppercase",
    color: `${white} !important`,
  },

  formSelect: {
    margin: "5px auto 5px auto",
    border: "none",
    width: "100%",
    borderBottom: "1px solid gray",
    borderRadius: "0 !important",
    padding: "0 ",
    marginTop: "16px",
  },

  label: {
    color: "grey",
    fontStyle: "italic",
    fontWeight: "lighter",
    paddingLeft: "16px",
  },

  listItemText: {
    fontFamily: font,
    textTransform: "capitalize",
  },

  listItemTextSizes: {
    fontFamily: font,
    textTransform: "uppercase",
  },

  alertContainer: {
    width: "60%",
    position: "absolute",
    zIndex: "1",
    backgroundColor: aqua,
    borderRadius: "4px",
    left: "50%",
    transform: "translate(-50%)",
    marginTop: "1%",
    boxShadow:
      "0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important",

    " & h1": {
      fontSize: "1.5rem",
      color: black,
      textTransform: "uppercase",
      textAlign: "center",

      "& span": {
        fontStyle: "italic",
      },
    },

    " & p": {
      textAlign: "center",
      color: black,
    },

    "& div": {
      display: "flex",
      justifyContent: "center",
    },
  },
};
export default theme;
