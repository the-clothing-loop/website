import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import themeFile from "./util/theme";
import jwtDecode from "jwt-decode";

// Pages
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";

// Components
import NavBar from "./components/Navbar";
import AuthRoute from "./util/AuthRoute";

const theme = createMuiTheme(themeFile);

// let authenticated;

// const token = localStorage.FBIdToken;

// if (token) {
//   const decodedToken = jwtDecode(token);
//   if (decodedToken.exp * 1000 < Date.now()) {
//     window.location.href = "/login";
//     authenticated = false;
//   } else {
//     authenticated = true;
//   }
// } else {
//   authenticated = false;
// }

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Router>
          <NavBar />
          <div className="container">
            <Switch>
              <Route exact path="/" component={home} />
              <Route
                exact
                path="/login"
                component={login}
                // authenticated={authenticated}
              />
              <Route exact path="/signup" component={signup} />
            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
