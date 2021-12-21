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

const font = ["Montserrat"].join(",");

const theme = {
  palette: {
    primary: {
      light: aqua,
      main: yellow,
      dark: bronze,
      contrastText: white,
    },
    secondary: {
      light: aqua,
      main: turquoise,
      dark: bronze,
      contrastText: black,
    },
    divider: yellow,
  },

  typography: {
    fontFamily: ["Montserrat"].join(","),
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
    color: "rgba(0, 0, 0, 0.6)",
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
    flexDirection: "row",
    alignItems: "center",
    zIndex: "1111",
    height: "10vh",

    "& div.language-switcher-wrapper": {
      paddingRight: "2%",
      "& div#simple-select": {
        textTransform: "uppercase",
      },
    },

    "& .MuiButtonBase-root": {
      fontSize: "1.2rem",
      marginRight: "1rem",
    },
    "& .MuiSelect-root": {
      fontSize: "1.2rem",
    },
  },

  headerNav: {
    minHeight: "4rem",
    display: "flex",
    alignItems: "center",
  },

  headerRight: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  buttonContained: {
    position: "relative",
    margin: "15px 15px 15px 15px",
    backgroundColor: yellow,
    color: "#fff",
    width: "9rem",
    height: "2.625rem",
  },

  logo: {
    fontSize: "2rem",
    margin: "0 3rem",
    color: bronze,
    textTransform: "uppercase",
  },

  buttonOutlined: {
    position: "relative",
    margin: "15px 15px 15px 15px",
    border: `1px solid ${yellow}`,
    color: "black",
    width: "9rem",
    height: "2.625rem",
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
    margin: "0 2%",
    minWidth: "max-content",
    width: "9rem",
    height: "2.625rem",
  },

  menuItem: {
    textTransform: "uppercase",
  },

  // Styling for forms
  form: {
    textAlign: "center",
    backgroundColor: aqua,
    borderRadius: "4px",
    boxShadow:
      "0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important",
  },

  formGrid: {
    display: "grid",
    gridTemplateRows: "58px 58px 58px 58px 58px auto",
  },

  threeColumnsForm: {
    height: "100%",
    textAlign: "center",
    backgroundColor: aqua,
  },

  singleForm: {
    textAlign: "center",
    backgroundColor: aqua,
    borderRadius: "4px",
    boxShadow:
      "0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important",

    position: "relative",
    left: "50%",
    top: "50%",
    transform: "translate(-50%)",
    width: "50%",
    padding: "2% 5%",
  },
  formContainer: {
    margin: " 0 5%",
    position: "relative",
    top: "50%",
    transform: "translateY(-50%)",
  },
  contactFormWrapper: {
    height: "100%",
    backgroundColor: aqua,

    "& div": {
      "& div": {
        boxShadow: "none !important",
      },
    },
  },

  formImg: {
    position: "relative",
    top: "50%",
    transform: "translateY(-50%)",
  },

  formSubmitActions: {
    display: "flex",
    justifyContent: "space-around",
  },
  image: {
    margin: "20px auto auto auto",
  },
  pageTitle: {
    margin: "20px auto 20px auto",
    fontFamily: font,
    fontSize: "1.5rem",
    textTransform: "uppercase",
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

  textArea: {
    backgroundColor: white,
    borderRadius: "4px",
    padding: "1%",
    border: `1px solid ${turquoise} `,
  },
  button: {
    margin: "5% 0",
    width: "9rem",
    height: "2.625rem",
    display: "block",
    position: "relative",
    left: "50%",
    transform: "translateX(-50%)",
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

  pageGrid: {
    backgroundColor: aqua,
    textAlign: "center",
    height: "50vh",
    margin: " 5%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: " 5px",
    boxShadow:
      "0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important",
  },

  pageDescription: {
    textAlign: "left",
    padding: "5% 0",

    "& p": {
      display: "inline",
    },
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

    "&:before": {
      borderColor: yellow,
    },
    "&:after": {
      borderColor: yellow,
    },
    "&:not(.Mui-disabled):hover::before": {
      borderColor: yellow,
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
    borderBottom: "1px solid rgba(255, 255, 255, 0.7);",
    borderRadius: "0 !important",
    padding: "0 ",
    marginTop: "16px",
  },

  label: {
    color: "rgba(0, 0, 0, 0.6)",
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

  footer: {
    backgroundColor: teal,
    color: white,
    width: "100%",
    height: "10rem",
    position: "relative",
    bottom: 0,
    padding: "0 5%",
    boxShadow: " 0px -4px 3px rgba(0, 0, 0, 0.2)",
    zIndex: "11",

    "& a": {
      color: "inherit",
      fontSize: "1.3em",
    },
  },

  footerNav: {
    color: "inherit",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: "0 5%",
    height: "6rem",
  },

  socialMediaLinkContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    height: "4rem",
  },

  socialMediaLink: {
    color: "inherit",
    fontSize: "2.5rem",
    marginLeft: "1.5rem",
  },

  contactsWrapper: {
    height: "100%",
  },

  errorDiv: {
    margin: "0 !important",
    color: "red",
    textAlign: "initial",
  },
};
export default theme;
