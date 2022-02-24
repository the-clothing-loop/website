//media
import CarouselImgOne from "../images/Tassen-voor-carrousel3.jpg";
import CarouselImgTwo from "../images/Tassen-voor-carrousel2.jpg";

const Carousel = () => {
  const featuredImages = [CarouselImgOne, CarouselImgTwo, CarouselImgOne];

  return (
    <div
      style={{
        display: "grid",
        overflow: "hidden",
        position: "relative",
        gridTemplateColumns: "50% 50%",
        height: "319px",
      }}
    >
      <h1
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
          color: "white",
          top: "50%",
          margin: "0",
          textTransform: "uppercase",
        }}
      >
        The Clothing Loop
      </h1>
      <div style={{ display: "flex" }}>
        <img
          src={CarouselImgOne}
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
          alt=""
        />
      </div>
      <div style={{ display: "flex" }}>
        <img
          src={CarouselImgTwo}
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
          alt=""
        />
      </div>
    </div>
  );
};

export default Carousel;
