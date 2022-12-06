//media
const CarouselImgOne = "/images/Tassen-voor-carrousel3.jpg";
const CarouselImgTwo = "/images/Tassen-voor-carrousel2.jpg";

const Carousel = () => {
  const featuredImages = [CarouselImgOne, CarouselImgTwo, CarouselImgOne];

  return (
    <div className="overflow-hidden max-h-80">
      <div className="relative w-full overflow-hidden h-[30vw]">
        <figure className="relative flex  h-full animate-slide">
          {featuredImages.map((img, i) => {
            return (
              <img
                src={img}
                key={i}
                alt="bags full of clothes"
                className="inline h-full"
              />
            );
          })}
        </figure>
      </div>
    </div>
  );
};

export default Carousel;
