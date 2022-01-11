//media
import CarouselImgOne from "../images/carousel_image_one.png";
import CarouselImgTwo from "../images/carousel_image_two.png";

const Carousel = () => {
  const featuredImages = [CarouselImgOne, CarouselImgTwo, CarouselImgOne];

  return (
    <div id="slider" style={{}}>
      <figure>
        {featuredImages.map((img, i) => {
          return <img src={img} key={i} alt="" />;
        })}
      </figure>
    </div>
  );
};

export default Carousel;
