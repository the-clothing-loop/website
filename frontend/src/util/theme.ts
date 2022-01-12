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
    position: "relative",
    padding: "0 80px",
    backgroundColor: "white",
    boxShadow: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    zIndex: "11111111",
    height: "10vh",

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

    "& a": {
      fontWeight: " 500",
      fontStyle: " normal",
      fontSize: "1rem",
      lineHeight: " 21.86px",
      color: "#3C3C3B",
      padding: "12px 32px",
      margin: "0px 24px",
    },
  },

  headerRight: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  languageSwitcherWrapper: {
    marginLeft: " 24px",
    padding: "12px 0",
    paddingLeft: " 32px",
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
    fontSize: "24px",
    color: black,
    textTransform: "uppercase",
    lineHeight: "29.2px",
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
    backgroundColor: white,
    color: yellow,
    border: `1.54px solid ${yellow}`,
    padding: "12px, 32px, 12px, 32px",
    boxSizing: " border-box",
    minWidth: "max-content",
    width: "188.43px",
    height: "46px",
    borderRadius: "0",
    textTransform: "initial",
    fontSize: "1rem",
    lineHeight: "21.86px",

    "& span": {
      color: yellow,
      fontSize: "1rem",
    },
  },

  animatedBtn: {
    width: "200px",
    height: "50px",
    lineHeight: "50px",
    border: "2px solid #fff",
    margin: "30px 0",
    position: "relative",
    cursor: "pointer",
    transition: "all 1s ease",
    overflow: "hidden",

    "&::before": {
      content: "",
      width: "100%",
      height: "100%",
      backgroundColor: "#fff",
      position: "absolute",
      transition: " all 1s ease",
    },
    " & > span": {
      textAlign: "center",
      textTransform: "uppercase",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "16px",
      position: "relative",
      zIndex: "1",
      transition: "all 1s ease",
    },
  },

  circleBtn: {
    position: "relative",
    backgroundColor: "white",
    width: "86px",
    height: "86px",
    borderRadius: "50%",
    outline: `solid 1px ${turquoise}`,
    transition: " outline 0.6s linear",
    margin: " 0",
    left: "50%",
    transform: "translateY(-50%)",

    "&:hover": {
      outlineWidth: "20px",
    },
  },
  menuItem: {
    color: black,
    textTransform: "capitalize",
    fontFamily: "Montserrat !important",
    fontWeight: "500 !important",
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
  geocoder: {
    height: "20px",
  },

  pageGrid: {
    transform: " translate(-50%, -50%)",
    position: "absolute",
    top: "50%",
    left: "50%",
    backgroundColor: aqua,
    textAlign: "center",
    minHeight: "80vh",
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
    color: black,
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
    color: black,
    fontWeight: "500 !important",
    zIndex: "111111111",
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
    paddingTop: "152px",
    backgroundColor: "#ffff",
    color: black,
    width: "100%",
    position: "relative",
    bottom: 0,
    zIndex: "11",

    "& a": {
      color: "inherit",
      fontSize: "1.3em",
    },
  },

  footerWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    paddingLeft: "50px",
  },

  footerSections: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: "1% 0",
  },

  footerSection: {
    width: "50%",
    display: "flex",
    flexDirection: "column",

    "& h5": {
      fontStyle: " normal",
      fontSize: " 24px",
      lineHeight: "32.8px",
      color: teal,
      padding: "2% 0",
      fontWeight: "800",
    },

    "& a": {
      fontStyle: "normal",
      fontSize: "1rem",
      lineHeight: "21.86px",
      paddingTop: "8px",
      cursor: "pointer",

      "&:hover": {
        textDecoration: "none",
      },
    },
  },

  footerLegalWrapper: {
    backgroundColor: teal,
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",

    "& p": {
      margin: "27px 80px",
      fontWeight: "300",
      fontStyle: "normal",
      fontSize: "16px",
      lineHeight: "21.86px",
      color: white,

      "& span": {
        color: white,
        fontWeight: "800",
      },
    },
  },

  legalLinks: {
    margin: "27px 80px",
    "& a": {
      fontStyle: "normal",
      fontSize: "1rem",
      lineHeight: "21.86px",
      paddingRight: " 34px",
      cursor: "pointer",
      color: white,
      "&:hover": {
        textDecoration: "none",
      },
    },
  },
  // footerNav: {
  //   color: "inherit",
  //   display: "flex",
  //   flexDirection: "row",
  //   justifyContent: "space-evenly",
  //   padding: "0 5%",
  //   height: "6rem",
  // },

  // socialMediaLinkContainer: {
  //   display: "flex",
  //   flexDirection: "row-reverse",
  //   alignItems: "center",
  //   height: "4rem",
  // },

  // socialMediaLink: {
  //   color: "inherit",
  //   fontSize: "2.5rem",
  //   marginLeft: "1.5rem",
  // },

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

  sizesDropdownWrapper: {
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

  landingPageDesktop: {
    backgroundColor: "#FFFFFF",
  },

  landingPageWrapper: {
    position: "relative",

    "& .background-box": {
      position: "absolute",
      height: "40%",
      backgroundColor: aqua,
      width: "100vw",

      "& .circles-frame": {
        position: "relative",
        marginLeft: "40%",
        marginTop: "1%",

        "& img:nth-of-type(1)": {
          paddingRight: "8px",
        },
      },
    },

    "& .landing-page-hero": {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      zIndex: "111111",
      position: "relative",

      "& .hero-text-wrapper": {
        position: "relative",
        marginTop: "10%",
        padding: " 0 80px",

        "& h1": {
          fontSize: "7rem",
          lineHeight: "7rem",
          fontWeight: "900",
          color: "#518D7E",
          margin: "2rem 0",
          fontFamily: "'Playfair Display', serif",

          "& span": {
            WebkitTextStroke: "1.5px #518d7e",
            color: "transparent",
          },
        },

        "& p": {
          margin: " 2rem 0",
          color: "#3C3C3B",
          fontSize: "1.25rem",
          lineHeight: "2rem",
        },
      },

      "& .hero-image-wrapper": {
        marginTop: "5%",
        position: "relative",

        "& .image-wrapper": {
          position: "relative",
          overflow: "hidden",
          maxHeight: "80%",

          " & img": {
            width: "100%",
            height: "auto",
            position: "relative",
            top: "-10%",
          },
        },
        "& .icon": {
          width: "50%",
          height: "auto",
          color: turquoise,
          position: "relative",
          top: "50%",
          left: "50%",
          transform: " translate(-50%, -50%)",
        },
      },
    },
  },

  sectionsWrapper: {
    marginTop: "5% 0",
    "& .single-section-wrapper": {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      margin: "5% 0",
      position: "relative",

      "& .image-wrapper": {
        position: "relative",
        height: "90%",
        overflow: "hidden",

        "& img": {
          width: "100%",
          height: "auto",
          position: "relative",
          left: "80px",
          zIndex: "1",
        },
      },

      "& .circles-frame": {
        position: "absolute",
        left: " 1%",
        bottom: "-10%",
      },

      "& .text-wrapper": {
        textAlign: "left",
        paddingLeft: "2%",
        marginBottom: "2%",

        "& h1": {
          fontFamily: "'Playfair Display', serif",
          fontWeight: " bold",
          fontSize: "12.5rem",
          WebkitTextStroke: `1.5px ${turquoise}`,
          color: "transparent",
          margin: "0",
          lineHeight: "96.3%",
        },

        "& h3": {
          color: turquoise,
          fontSize: "5rem",
          margin: "0",
          fontFamily: "'Playfair Display', serif",
        },

        "& p": {
          color: turquoise,
          fontSize: "1.25rem",
          lineHeight: "2.5rem",

          "& a": {
            fontFamily: "'Playfair Display', serif",
            fontWeight: "900",
            fontSize: "24px",
            lineHeight: "40px",
            textDecoration: "underline",
            color: "#518d7e",
          },
        },
      },
    },

    "& .single-section-wrapper-2": {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      margin: "5% 0",
      position: "relative",

      "& .text-wrapper": {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",

        "& h1": {
          fontFamily: "Playfair Display, serif",
          fontWeight: " bold",
          fontSize: "16.8rem",
          WebkitTextStroke: "1.5px #48808B",
          color: "transparent",
          margin: "0",
          lineHeight: "96.3%",
        },

        "& div": {
          padding: "0 2%",
          width: "40%",

          "& h3": {
            color: "#48808B",
            fontFamily: "'Playfair Display', serif",
            fontSize: "5rem",
            lineHeight: "4.8rem",
            marginBottom: "2%",
          },

          "& p": {
            color: teal,
            textAlign: "left",
            fontSize: "1.25rem",
            height: " 2rem",

            "& a": {
              display: "block",
              margin: "2% 0",
            },
          },
        },
      },

      "& .circles-frame": {
        position: "absolute",
        right: "0",
        top: "-10%",
        zIndex: "11",
      },
    },

    "& .single-section-wrapper-3": {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      position: "relative",
      marginTop: "10%",

      "& .circles-frame": {
        position: "absolute",
        left: "20%",
        top: "-10%",
      },

      "& .background-box": {
        justifySelf: "center",
        position: "absolute",
        height: "80%",
        backgroundColor: "#F7C86F",
        width: "722px",
        opacity: " 0.3",
      },

      "& .image-wrapper": {
        position: "relative",
        marginTop: "calc(549px / 2)",
        transform: "translateY(-50%)",
        display: "flex",
        justifyContent: "end",
      },

      "& .text-wrapper": {
        padding: "0 5%",
        position: "relative",
        bottom: "20%",

        "& h1": {
          fontFamily: "'Playfair Display', serif",
          fontWeight: " bold",
          fontSize: "16.8rem",
          WebkitTextStroke: `2px ${bronze}`,
          color: "transparent",
          margin: "0",
          lineHeight: "96.3%",
        },

        "& div": {
          marginRight: "15%",

          "& h3": {
            color: bronze,
            fontFamily: "'Playfair Display', serif",
            fontSize: "5rem",
            lineHeight: "4.8rem",
            marginBottom: "10%",
            marginTop: "5%",
          },

          "& p": {
            color: bronze,
            textAlign: "left",
            fontSize: "1.25rem",
            height: " 2rem",
          },
        },
      },
    },
  },

  imageAnimatedWrapper: {
    outline: `solid 1px ${teal}`,
    transition: " outline 0.6s linear",
    margin: " 0.5em",
    position: "relative",
    overflow: "hidden",
    height: "90%",
    width: "90%",

    "&:hover": {
      outlineWidth: "80px",
    },

    "& img": {
      width: "100%",
      height: "auto",
      position: "relative",
      zIndex: "111",
    },
  },

  projectNumbersWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",

    "& .inner-wrapper": {
      backgroundColor: turquoise,
      display: "flex",
      flexDirection: "column",
      paddingLeft: "5%",

      "& h1": {
        fontFamily: "Playfair Display",
        color: white,
        fontSize: "6rem",
      },
    },

    "& .images-wrapper": {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",

      "& *": {
        position: "relative",
        width: "50%",

        "& *": {
          height: "100%",
          width: "100%",
        },
      },
    },
  },

  aboutSectionWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    margin: "5% 0",

    "& .image-wrapper": {
      "& img": {
        width: "100%",
        height: "auto",
        objectFit: "cover",
      },
    },

    "& .text-wrapper": {
      paddingRight: "15%",
      paddingLeft: "5%",
      position: "relative",
      bottom: "15%",

      "& h3": {
        color: teal,
        fontFamily: "Playfair Display",
        fontSize: "3rem",
        lineHeight: "4rem",
        fontWeight: "bold",
      },

      "& p": {
        color: teal,
        fontSize: "1.25rem",
        lineHeight: "2rem",
        fontWeight: "normal",
      },

      "& h5": {
        color: teal,
        fontSize: "1.5rem",
        lineHeight: "2rem",
        fontWeight: "900",
        textDecoration: "underline",
        fontFamily: "Playfair Display",
      },
    },
  },

  supportersSection: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    margin: "5% 5%",

    "& .background-box": {
      position: "absolute",
      height: "252px",
      backgroundColor: aqua,
      opacity: "0.3",
      width: "721px",
      left: "-5%",
      transform: "translateY(50%)",
    },

    "& h2": {
      color: teal,
      fontFamily: "Playfair Display",
      fontSize: "5rem",
      lineHeight: "96.3%",
      fontWeight: "bold",
      zIndex: "1",
    },

    "& .logos-wrapper": {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      zIndex: "1",

      "& *": {
        width: "200px",
        height: "200px",
        display: "flex",
        alignItems: "center",

        "& *": {
          width: "100%",
          height: "auto",
        },
      },
    },
  },

  countersWrapper: {
    display: "flex",
    flexWrap: "wrap",

    "& .isVisible": {
      position: "relative",
      width: "50%",
      paddingLeft: "5%",

      "& h1": {
        fontFamily: "Playfair Display",
        color: "transparent",
        WebkitTextStroke: "1px white",
        fontSize: "78px",
        margin: "1% 0",
      },

      "& h3": {
        fontFamily: "Playfair Display",
        color: "white",
        fontSize: "49px",
        margin: "1% 0",
      },
    },
  },

  counterLinkWrapper: {
    position: "relative",
    width: "50%",
    paddingLeft: "5%",

    "& div": {
      height: "105px",
      display: "flex",
      alignItems: "center",

      "& a": {
        backgroundColor: "#F7C86F",
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        display: "inline-block",
        top: "50%",
        position: "relative",
        transform: "translateY(-50%)",

        "& .icon": {
          position: "relative",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-90deg) ",
          color: "white",
        },
      },
    },

    "& h3": {
      fontFamily: "Playfair Display",
      color: "white",
      fontSize: "49px",
      margin: "1% 0",
    },
  },
};
export default theme;
