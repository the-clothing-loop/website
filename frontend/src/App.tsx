import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import { AuthProvider } from "./components/AuthProvider";
import themeFile from "./util/theme";

// Pages
import Map from "./pages/Map";
import Login from "./pages/Login";
import Thankyou from "./pages/Thankyou";
import ChainMemberList from "./pages/ChainMemberList";
import NewChainSignup from "./pages/NewChainSignup";
import Signup from "./pages/Signup";
import NewChainLocation from "./pages/NewChainLocation";
import UserEdit from "./pages/UserEdit";
import ChainEdit from "./pages/ChainEdit";
import ChainsList from "./pages/ChainsList";
import ChainInformation from "./pages/ChainInformation";
import About from "./pages/About";
import LoginEmailFinished from "./pages/LoginEmailFinished";

// Components
import Navbar from "./components/Navbar";
import { Logout } from "./pages/Logout";

const theme = createMuiTheme(themeFile);

const App = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <AuthProvider>
        <div className="App">
          <Router>
            <Navbar />
            <div className="container">
              <Switch>
                <Route exact path="/" component={About} />
                <Route exact path="/thankyou" component={Thankyou} />
                <Route exact path="/users/login-email-finished/:email" component={LoginEmailFinished} />
                <Route exact path="/users/login" component={Login} />
                <Route exact path="/users/logout" component={Logout} />
                <Route exact path="/users/signup/:chainId" component={Signup} />
                <Route exact path="/users/edit/:userId" component={UserEdit} />
                <Route exact path="/chains/find" component={Map} />
                <Route exact path="/chains/edit/:chainId" component={ChainEdit} />
                <Route exact path="/chains/members/:chainId" component={ChainMemberList} />
                <Route exact path="/chains/new-location/:userId" component={NewChainLocation} />
                <Route exact path="/chains/new-signup" component={NewChainSignup} />
                <Route exact path="/chains/information/:chainId" component={ChainInformation} />
                <Route exact path="/chains" component={ChainsList} />
              </Switch>
            </div>
          </Router>
        </div>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

export default App;
