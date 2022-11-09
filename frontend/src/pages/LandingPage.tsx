export default function LandingPage() {
  return (
    <div className="landing-page-wrapper">
      <h1 className="tw-text-5xl tw-absolute tw-text-white tw-p-2">
        The Clothing Loop
      </h1>
      <video width="100%" height="80%" autoPlay loop muted>
        <source src="/videos/TCL-video.mp4" type="video/mp4" />
      </video>
      <h4 className="tw-absolute tw-bottom-[20%] tw-text-center tw-text-white tw-capitalize tw-w-full ">
        Coming Soon
      </h4>
    </div>
  );
}
