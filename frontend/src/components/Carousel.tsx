//media
const CarouselImgOne =
  "https://ucarecdn.com/35bdfbb0-4885-44b8-903e-132358febffd/-/format/auto/Tassenvoorcarrousel3.jpg";
const CarouselImgTwo =
  "https://ucarecdn.com/d19a0904-9b27-4ec1-8b3d-9e4dd1f7b136/-/format/auto/Tassenvoorcarrousel2.jpg";

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
