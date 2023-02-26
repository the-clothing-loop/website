import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import ScrollToTop from "./util/scrollToTop";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Logout } from "./pages/Logout";
import { ChainsProvider } from "./providers/ChainsProvider";

// Pages
import { NewLoopConfirmation, JoinLoopConfirmation } from "./pages/Thankyou";
import Home from "./pages/Home";
import { ToastProvider } from "./providers/ToastProvider";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

// Lazy
const FindChain = React.lazy(() => import("./pages/FindChain"));
const Login = React.lazy(() => import("./pages/Login"));
const ChainMemberList = React.lazy(() => import("./pages/ChainMemberList"));
const NewChainSignup = React.lazy(() => import("./pages/NewChainSignup"));
const Signup = React.lazy(() => import("./pages/Signup"));
const NewChainLocation = React.lazy(() => import("./pages/NewChainLocation"));
const UserEdit = React.lazy(() => import("./pages/UserEdit"));
const ChainEdit = React.lazy(() => import("./pages/ChainEdit"));
const LoginEmailFinished = React.lazy(
  () => import("./pages/LoginEmailFinished")
);
const Contacts = React.lazy(() => import("./pages/Contacts"));
const MessageSubmitted = React.lazy(() => import("./pages/MessageSubmitted"));
const Donate = React.lazy(() => import("./pages/Donations/Donate"));
const About = React.lazy(() => import("./pages/About"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = React.lazy(() => import("./pages/TermsOfUse"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Events = React.lazy(() => import("./pages/Events"));
const EventDetails = React.lazy(() => import("./pages/EventDetails"));

const IS_PRODUCTION =
  import.meta.env.VITE_BASE_URL === "https://www.clothingloop.org";

let base = "/:locale(en|nl|fr|sv)";
if (!IS_PRODUCTION) {
  base = "/:locale(en|nl|de|fr|es|sv)";
}

export default function App() {
  const { i18n } = useTranslation();
  useEffect(() => {
    document
      .getElementsByTagName("html")[0]
      .setAttribute("lang", i18n.language);
  }, [i18n.language]);

  return (
    <Router>
      <AuthProvider>
        <ChainsProvider>
          <div className="min-h-screen">
            <ToastProvider>
              <ScrollToTop>
                <Navbar />
                <Switch>
                  <Route exact path={`${base}/`} component={Home} />
                  <Route
                    exact
                    path={`${base}/thankyou`}
                    component={JoinLoopConfirmation}
                  />
                  <Route
                    exact
                    path={`${base}/donate/:status?`}
                    component={Donate}
                  />
                  <Route exact path={`${base}/events/`} component={Events} />
                  <Route
                    exact
                    path={`${base}/eventdetails/`}
                    component={EventDetails}
                  />

                  <Route
                    exact
                    path={`${base}/message-submitted`}
                    component={MessageSubmitted}
                  />

                  <Route
                    exact
                    path={`${base}/users/login/validate`}
                    component={LoginEmailFinished}
                  />
                  <Route exact path={`${base}/users/login`} component={Login} />
                  <Route
                    exact
                    path={`${base}/users/logout`}
                    component={Logout}
                  />
                  <Route
                    exact
                    path={`${base}/users/:userUID/edit`}
                    component={UserEdit}
                  />

                  <Route
                    exact
                    path={`${base}/loops`}
                    component={() => <Redirect to="/admin/dashboard" />}
                  />
                  <Route
                    exact
                    path={`${base}/loops/find`}
                    component={FindChain}
                  />
                  <Route
                    exact
                    path={`${base}/loops/:chainUID/edit`}
                    component={ChainEdit}
                  />
                  <Route
                    exact
                    path={`${base}/loops/:chainUID/members`}
                    component={ChainMemberList}
                  />
                  <Route
                    exact
                    path={`${base}/loops/new/users/signup`}
                    component={NewChainSignup}
                  />
                  <Route
                    exact
                    path={`${base}/loops/new`}
                    component={NewChainLocation}
                  />
                  <Route
                    exact
                    path={`${base}/loops/new/confirmation`}
                    component={NewLoopConfirmation}
                  />
                  <Route
                    exact
                    path={`${base}/loops/:chainUID/users/signup`}
                    component={Signup}
                  />

                  <Route exact path={`${base}/faq`} component={FAQ} />
                  <Route
                    exact
                    path={`${base}/contact-us`}
                    component={Contacts}
                  />
                  <Route exact path={`${base}/about`} component={About} />

                  <Route
                    exact
                    path={`${base}/terms-of-use`}
                    component={TermsOfUse}
                  />
                  <Route
                    exact
                    path={`${base}/privacy-policy`}
                    component={PrivacyPolicy}
                  />

                  <Route
                    exact
                    path={`${base}/admin/dashboard`}
                    component={AdminDashboard}
                  />
                  <Route path={`${base}/*`} component={FileNotFound} />
                  <Route path="*" component={I18nRedirect} />
                </Switch>
                <Footer />
              </ScrollToTop>
            </ToastProvider>
          </div>
        </ChainsProvider>
      </AuthProvider>
    </Router>
  );
}

function I18nRedirect() {
  const location = useLocation();
  const { i18n } = useTranslation();

  return (
    <Redirect
      to={{
        pathname: "/" + i18n.language + location.pathname,
        search: location.search,
        state: location.state,
      }}
    />
  );
}

function FileNotFound() {
  return (
    <div className="max-w-screen-sm mx-auto flex-grow flex flex-col justify-center items-center">
      <h1 className="font-serif text-secondary text-4xl font-bold my-10">
        404 File not found
      </h1>
      <Link to="/" className="btn btn-primary">
        {t("home")}
      </Link>
    </div>
  );
}
