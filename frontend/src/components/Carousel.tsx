//media
import CarouselImgOne from "../images/Tassen-voor-carrousel3.jpg";
import CarouselImgTwo from "../images/Tassen-voor-carrousel2.jpg";

const Carousel = () => {
  const featuredImages = [CarouselImgOne, CarouselImgTwo, CarouselImgOne];

  return (
    <div className="tw-relative tw-w-full tw-overflow-hidden tw-h-[40vh]">
      <figure className="tw-relative tw-w-[500%] tw-m-0 tw-animate-slide">
        {featuredImages.map((img, i) => {
          return (
            <img
              src={img}
              key={i}
              alt="bags"
              className="tw-w-[20%] tw-float-left"
            />
          );
        })}
      </figure>
    </div>
  );
};

export default Carousel;
