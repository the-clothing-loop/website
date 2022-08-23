//media
import CarouselImgOne from "../images/Tassen-voor-carrousel3.jpg";
import CarouselImgTwo from "../images/Tassen-voor-carrousel2.jpg";

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
