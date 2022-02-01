import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { createTheme } from "@mui/material/styles";
import { AuthProvider } from "./components/AuthProvider";
import themeFile from "./util/theme";

// Pages
import FindChain from "./pages/FindChain";
import Login from "./pages/Login";
import Thankyou from "./pages/Thankyou";
import ChainMemberList from "./pages/ChainMemberList";
import NewChainSignup from "./pages/NewChainSignup";
import Signup from "./pages/Signup";
import NewChainLocation from "./pages/NewChainLocation";
import UserEdit from "./pages/UserEdit";
import ChainEdit from "./pages/ChainEdit";
import ChainsList from "./pages/ChainsList";
import Home from "./pages/Home";
import LoginEmailFinished from "./pages/LoginEmailFinished";
import Contacts from "./pages/Contacts.js";
import LandingPage from "./pages/LandingPage";
import MessageSubmitted from "./pages/MessageSubmitted";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import FAQ from "./pages/FAQ";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Logout } from "./pages/Logout";
import { ChainsProvider } from "./components/ChainsProvider";

const theme = createTheme(themeFile);

const App = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <AuthProvider>
        <ChainsProvider>
          <div className="app">
            <Router>
              <Navbar />
              <div className="container">
                <Switch>
                  <Route exact path="/home" component={Home} />
                  <Route exact path="/thankyou" component={Thankyou} />
                  <Route
                    exact
                    path="/message-submitted"
                    component={MessageSubmitted}
                  />

                  <Route
                    exact
                    path="/users/login-email-finished/:email"
                    component={LoginEmailFinished}
                  />
                  <Route exact path="/users/login" component={Login} />
                  <Route exact path="/users/logout" component={Logout} />
                  <Route
                    exact
                    path="/users/signup/:chainId"
                    component={Signup}
                  />
                  <Route
                    exact
                    path="/users/edit/:userId"
                    component={UserEdit}
                  />
                  <Route exact path="/loops/find" component={FindChain} />
                  <Route
                    exact
                    path="/loops/edit/:chainId"
                    component={ChainEdit}
                  />
                  <Route
                    exact
                    path="/loops/members/:chainId"
                    component={ChainMemberList}
                  />
                  <Route
                    exact
                    path="/loops/new-location/:userId"
                    component={NewChainLocation}
                  />
                  <Route
                    exact
                    path="/loops/new-signup"
                    component={NewChainSignup}
                  />
                  <Route exact path="/loops" component={ChainsList} />
                  <Route exact path="/contact-us" component={Contacts} />
                  <Route exact path="/" component={LandingPage} />
                  <Route exact path="/about" component={About} />
                  <Route
                    exact
                    path="/privacy-policy"
                    component={PrivacyPolicy}
                  />
                  <Route exact path="/terms-of-use" component={TermsOfUse} />
                  <Route exact path="/FAQ" component={FAQ} />
                </Switch>
              </div>
              <Footer />
            </Router>
          </div>
        </ChainsProvider>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

export default App;
