import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@material-ui/core";

const Navbar = () => {
  return (
    <AppBar position="fixed">
      <Toolbar className="nav-container">
        <Button color="inherit" component={Link} to="/login" >Login</Button>
        <Button color="inherit" component={Link} to="/" >Home</Button>
        <Button color="inherit" component={Link} to="signup" >Signup</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar
