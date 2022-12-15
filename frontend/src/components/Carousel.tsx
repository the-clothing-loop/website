//media
const CarouselImgOne =
  "https://ucarecdn.com/35bdfbb0-4885-44b8-903e-132358febffd/-/format/auto/-/resize/x320/Tassenvoorcarrousel3.jpg";
const CarouselImgTwo =
  "https://ucarecdn.com/d19a0904-9b27-4ec1-8b3d-9e4dd1f7b136/-/format/auto/-/resize/x320/Tassenvoorcarrousel2.jpg";

const Carousel = () => {
  const featuredImages = [
    CarouselImgOne,
    CarouselImgTwo,
    CarouselImgOne,
    CarouselImgTwo,
  ];

  return (
    <div className="relative w-full max-h-80 h-[30vw] overflow-hidden">
      <figure className="relative flex h-full animate-slide">
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
/**
 * 
 * <div className="overflow-hidden animate-slide h-[30vw] max-h-80 w-full">
      <div
        className="h-full w-[200vw] bg-repeat-x"
        style={{
          backgroundImage: `url('${CarouselImgOne}')`,
        }}
      />
    </div>
 */
