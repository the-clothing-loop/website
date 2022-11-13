//media
const CarouselImgOne = "/images/Tassen-voor-carrousel3.jpg";
const CarouselImgTwo = "/images/Tassen-voor-carrousel2.jpg";

const Carousel = () => {
  const featuredImages = [CarouselImgOne, CarouselImgTwo, CarouselImgOne];

  return (
    <div className="tw-relative tw-w-full tw-overflow-hidden tw-h-[40vh]">
      <figure className="tw-relative tw-flex  tw-h-full tw-animate-slide">
        {featuredImages.map((img, i) => {
          return (
            <img
              src={img}
              key={i}
              alt="bags full of clothes"
              className="tw-inline tw-h-full"
            />
          );
        })}
      </figure>
    </div>
  );
};

export default Carousel;
