//media
const CarouselImgOne = "/images/Tassen-voor-carrousel3.jpg";
const CarouselImgTwo = "/images/Tassen-voor-carrousel2.jpg";

const Carousel = () => {
  const featuredImages = [CarouselImgOne, CarouselImgTwo, CarouselImgOne];

  return (
    <div className="relative w-full overflow-hidden h-[40vh]">
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
  );
};

export default Carousel;
