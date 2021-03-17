import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import themeFile from "./util/theme";

// Pages
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";
import users from "./pages/users";

// Components
import NavBar from "./components/Navbar";

const theme = createMuiTheme(themeFile);

const App = () => {
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
              <Route exact path="/users" component={users} />
            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
