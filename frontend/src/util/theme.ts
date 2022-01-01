const black = "#3C3C3B";
const white = "#ffff";
const teal = "#48808B";
const yellow = "#F7C86F";
const aqua = " #D5ECDF";
const lightBlue = "#98D9DE";
const turquoise = "#518D7E";
const bronze = "#C58C41";
const grey = "#A5A5A5";

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
    fontFamily: "Montserrat",
  },
  body2: {
    fontSize: 0.8,
  },
  p: {
    fontFamily: "Montserrat !important",
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
    fontFamily: "Montserrat",
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
        fontFamily: "Montserrat",
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
    padding: "2% 5%",
    display: "flex",
    flexDirection: "column",
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
    margin: " 1% 5%",
    position: "relative",
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
    fontFamily: "Montserrat",
    fontSize: "1.5rem",
    textTransform: "uppercase",
  },
  loopName: {
    fontFamily: "Montserrat",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "2rem ",
  },
  textField: {
    marginTop: "5px",
    border: "none",
    fontFamily: "Montserrat",
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

  pageGrid: {
    transform: " translate(-50%, -50%)",
    position: "absolute",
    top: "50%",
    left: "50%",
    backgroundColor: aqua,
    textAlign: "center",
    height: "80vh",
    width: "80%",
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
    padding: "1% 0",
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

    "& .css-1480iag-MuiInputBase-root-MuiInput-root:hover:not(.Mui-disabled)::before":
      {
        borderBottom: "none",
      },

    "& .css-1480iag-MuiInputBase-root-MuiInput-root::after": {
      borderBottom: "none",
    },

    "& > *": {
      marginLeft: "1% !important",
    },
  },

  checkbox: {
    color: `${yellow} !important`,
  },

  actionsWrapper: {
    display: "flex",
  },

  input: {
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
    fontFamily: "Montserrat",
    boxShadow:
      "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",
  },

  inputAdornment: {
    paddingLeft: "2%",
  },

  iconButton: {
    padding: 10,
  },

  select: {
    borderRadius: "4px",
    backgroundColor: "#fff",
    width: "100%",
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
    borderRadius: "0 !important",
    padding: "0 ",
    marginTop: "16px",
  },
  formControl: {
    width: "15rem",
  },

  label: {
    color: "rgba(0, 0, 0, 0.6)",
    fontStyle: "italic",
    fontWeight: "lighter",
    paddingLeft: "16px",
  },

  listItemText: {
    fontFamily: "Montserrat",
    textTransform: "capitalize",
  },

  listItemTextSizes: {
    fontFamily: "Montserrat",
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

  newLoopMap: {
    cursor: "pointer",
    filter: "drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25))",
  },

  inMapSearchBar: {
    position: "absolute",
    top: "20px",
    left: "20px",
  },

  contactsWrapper: {
    height: "100%",
  },

  errorDiv: {
    margin: "0 !important",
    color: "red",
    textAlign: "initial",
  },
  searchBarContainer: {
    padding: "2% 0%",
  },
  customLabelStyle: {
    fontFamily: "Montserrat !important",
  },

  activeIcon: {
    color: `${yellow} !important`,
  },

  completedIcon: {
    color: `${yellow} !important`,
  },

  stepLabel: {
    fontFamily: "Montserrat",
  },

  sizesFormWrapper: {
    display: "flex !important",
    flexDirection: "row !important",
  },
  popoverWrapper: {
    display: "flex",
    alignItems: "center",
    paddingTop: "10px",
    position: "absolute",
    left: "100%",
    top: "20%",
  },

  formFieldWithPopover: {
    display: "flex",
    position: "relative",
  },
  icon: {
    color: grey,
  },

  confirmationWrapper: {
    padding: "0 15%",

    " & > div ": {
      padding: "5% 0",
    },
  },

  infoAlert: {
    backgroundColor: "rgb(229, 246, 253)",
    color: " rgb(1, 67, 97)",
  },
  errorAlert: {
    backgroundColor: "rgb(253, 237, 237)",
    color: "rgb(95, 33, 32)",
  },
  successAlert: {
    backgroundColor: "rgb(237, 247, 237)",
    color: "rgb(30, 70, 32)",
  },
};
export default theme;
