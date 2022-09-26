import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import { AuthProvider } from "./components/AuthProvider";
import themeFile from "./util/theme";
import ScrollToTop from "./util/scrollToTop";

// Pages
import FindChain from "./pages/FindChain";
import Login from "./pages/Login";
import {
  NewLoopConfirmation,
  JoinLoopConfirmation,
} from "./pages/Thankyou/Thankyou";
import ChainMemberList from "./pages/ChainMemberList";
import NewChainSignup from "./pages/NewChainSignup";
import Signup from "./pages/Signup";
import NewChainLocation from "./pages/NewChainLocation";
import UserEdit from "./pages/UserEdit";
import ChainEdit from "./pages/ChainEdit";
import ChainsList from "./pages/ChainsList";
import Home from "./pages/Home";
import LoginEmailFinished from "./pages/LoginEmailFinished";
import Contacts from "./pages/Contacts";
import MessageSubmitted from "./pages/MessageSubmitted";
import Donate from "./pages/Donations/Donate";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import FAQ from "./pages/FAQ/FAQ";
import AdminControlsNav from "./components/AdminControlsNav/AdminControlsNav";
import { AddChainAdmin } from "./pages/AddChainAdmin";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Logout } from "./pages/Logout";
import { ChainsProvider } from "./components/ChainsProvider";

const theme = createTheme(themeFile);

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <AuthProvider>
          <ChainsProvider>
            <div className="app">
              <Router>
                <ScrollToTop>
                  <Navbar />
                  <div className="container">
                    <Switch>
                      <Route exact path="/" component={Home} />
                      <Route
                        exact
                        path="/thankyou"
                        component={JoinLoopConfirmation}
                      />
                      <Route exact path="/donate/:status?" component={Donate} />
                      <Route
                        exact
                        path="/message-submitted"
                        component={MessageSubmitted}
                      />

                      <Route
                        exact
                        path="/users/login/validate"
                        component={LoginEmailFinished}
                      />
                      <Route exact path="/users/login" component={Login} />
                      <Route exact path="/users/logout" component={Logout} />
                      <Route
                        exact
                        path="/users/:userUID/edit"
                        component={UserEdit}
                      />

                      <Route exact path="/loops" component={ChainsList} />
                      <Route exact path="/loops/find" component={FindChain} />
                      <Route
                        exact
                        path="/loops/:chainUID/edit"
                        component={ChainEdit}
                      />
                      <Route
                        exact
                        path="/loops/:chainUID/members"
                        component={ChainMemberList}
                      />
                      <Route
                        exact
                        path="/loops/:chainUID/addChainAdmin"
                        component={AddChainAdmin}
                      />
                      <Route
                        exact
                        path="/loops/new/users/signup"
                        component={NewChainSignup}
                      />
                      <Route
                        exact
                        path="/loops/new"
                        component={NewChainLocation}
                      />
                      <Route
                        exact
                        path="/loops/new/confirmation"
                        component={NewLoopConfirmation}
                      />
                      <Route
                        exact
                        path="/loops/:chainUID/users/signup"
                        component={Signup}
                      />

                      <Route exact path="/faq" component={FAQ} />
                      <Route exact path="/contact-us" component={Contacts} />
                      <Route exact path="/about" component={About} />

                      <Route
                        exact
                        path="/terms-of-use"
                        component={TermsOfUse}
                      />
                      <Route
                        exact
                        path="/privacy-policy"
                        component={PrivacyPolicy}
                      />

                      <Route
                        exact
                        path="/admin/dashboard"
                        component={AdminControlsNav}
                      />
                    </Switch>
                  </div>
                  <Footer />
                </ScrollToTop>
              </Router>
            </div>
          </ChainsProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
