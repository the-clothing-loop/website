//media
const CarouselImgOne =
  "https://images.clothingloop.org/x320/tassen_voor_carrousel3.jpg";
const CarouselImgTwo =
  "https://images.clothingloop.org/x320/tassen_voor_carrousel2.jpg";

const featuredImages = [
  CarouselImgOne,
  CarouselImgTwo,
  CarouselImgOne,
  CarouselImgTwo,
];

export default function Carousel() {
  return (
    <div className="relative w-full h-60 md:h-80 overflow-hidden">
      <div className="relative flex h-full animate-slide-small md:animate-slide">
        {featuredImages.map((img, i) => {
          return (
            <img
              src={img}
              key={i}
              alt="bags full of clothes"
              className="inline h-full max-w-none"
            />
          );
        })}
      </div>
    </div>
  );
}
