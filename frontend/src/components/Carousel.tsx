//media
const CarouselImgOne =
  "https://ucarecdn.com/35bdfbb0-4885-44b8-903e-132358febffd/-/format/auto/-/resize/x320/Tassenvoorcarrousel3.jpg";
const CarouselImgTwo =
  "https://ucarecdn.com/d19a0904-9b27-4ec1-8b3d-9e4dd1f7b136/-/format/auto/-/resize/x320/Tassenvoorcarrousel2.jpg";

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
