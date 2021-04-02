import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import themeFile from "./util/theme";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Thankyou from "./pages/Thankyou";
import ChainMemberList from "./pages/Chain/ChainMemberList";

//to review
import submitted from './pages/submittedMsg';
import startNewChain from './pages/newChainForm';

// Components
import Navbar from "./components/Navbar";

const theme = createMuiTheme(themeFile);

const App = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Router>
          <Navbar />
          <div className="container">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route
                exact
                path="/login"
                component={Login}
                // authenticated={authenticated}
              />
              <Route path="/signup" component={Signup} />
              <Route path="/thankyou" component={Thankyou} />
              <Route path="/chains/:chainId" component={ChainMemberList} />
              
            
              <Route path="/start-new-chain" component={startNewChain} /> 
              <Route path="/submitted" component={submitted} />
            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
