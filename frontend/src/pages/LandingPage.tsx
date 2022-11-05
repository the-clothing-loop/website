import { Typography } from "@mui/material";

const LandingPage = () => {
  return (
    <div className="landing-page-wrapper">
      <Typography
        variant="h1"
        className="tw-text-5xl tw-absolute tw-text-white tw-p-2"
      >
        The Clothing Loop
      </Typography>
      <video width="100%" height="80%" autoPlay loop muted>
        <source src="/videos/TCL-video.mp4" type="video/mp4" />
      </video>
      <Typography
        variant="h4"
        className="tw-absolute tw-bottom-[20%] tw-text-center tw-text-white tw-capitalize tw-w-full "
      >
        Coming Soon
      </Typography>
    </div>
  );
};

export default LandingPage;
