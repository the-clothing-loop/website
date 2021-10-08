//Material UI
import Typography from "@material-ui/core/Typography";

const LandingPage = () => {
  return (
    <div className="landing-page-wrapper">
      <Typography variant="h1" className="landing-page-logo">
        The Clothing Loop
      </Typography>
      <video width="100%" height="80%" autoPlay loop muted>
        <source src="/videos/TCL-video.mp4" type="video/mp4" />
      </video>
      <Typography variant="h4" className="landing-page-text">
        Coming Soon
      </Typography>
    </div>
  );
};

export default LandingPage;
