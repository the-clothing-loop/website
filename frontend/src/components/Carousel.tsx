//media
const CarouselImgOne = "/images/Tassen-voor-carrousel3.jpg";
const CarouselImgTwo = "/images/Tassen-voor-carrousel2.jpg";

const Carousel = () => {
  const featuredImages = [CarouselImgOne, CarouselImgTwo, CarouselImgOne];

  return (
    <div className="tw-relative tw-w-full tw-overflow-hidden tw-h-[40vh]">
      <figure className="tw-relative tw-w-[500%] tw-h-[40vh] tw-animate-slide">
        {featuredImages.map((img, i) => {
          return (
            <img src={img} key={i} alt="bags" className="tw-h-full tw-inline" />
          );
        })}
      </figure>
    </div>
  );
};

export default Carousel;
