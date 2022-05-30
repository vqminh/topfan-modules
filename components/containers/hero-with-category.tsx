import BannerCard from "../common/banner-card";
import CategoryListCard from "../common/category-list-card";
import Carousel from "../../ui/carousel/carousel";
import { SwiperSlide } from "swiper/react";
import { useCategoriesQuery } from "../../../src/framework/basic-rest/category/get-all-categories";
import { useWindowSize } from "../../utils/use-window-size";
import { homeTwoHeroBanner as heroBanner } from "../../../src/framework/basic-rest/static/banner";
import CategoryListCardLoader from "../../ui/loaders/category-list-card-loader";
import CategoryListFeedLoader from "../../ui/loaders/category-list-feed-loader";
import { ROUTES } from "../../../src/utils/routes";
import Alert from "../../ui/alert";
import React from "react";

interface Props {
	className?: string;
}

const categoryResponsive = {
	"1280": {
		slidesPerView: 4,
		spaceBetween: 28,
	},
	"768": {
		slidesPerView: 3,
		spaceBetween: 24,
	},
	"480": {
		slidesPerView: 2,
		spaceBetween: 20,
	},
	"0": {
		slidesPerView: 1,
		spaceBetween: 12,
	},
};

const HeroWithCategory: React.FC<Props> = ({
	className = "mb-12 md:mb-14 xl:mb-16",
}) => {
	const { width } = useWindowSize();
	const result = useCategoriesQuery({
		limit: 10,
	});
	const { isLoading, error } = result;
	const data = result.data;
	return (
		<div
			className={`grid grid-cols-1 2xl:grid-cols-5 gap-5 xl:gap-7 ${className}`}
		>
			{error ? (
				<Alert message={error?.message} />
			) : width < 1500 ? (
				<div>
					<Carousel breakpoints={categoryResponsive} buttonSize="small">
						{isLoading && !data?.length
							? Array.from({ length: 8 }).map((_, idx) => (
									<SwiperSlide key={`category-list-${idx}`}>
										<CategoryListCardLoader
											uniqueKey={`category-list-${idx}`}
										/>
									</SwiperSlide>
							  ))
							: data?.map((category) => (
									<SwiperSlide key={`category--key${category.id}`}>
										<CategoryListCard category={category} />
									</SwiperSlide>
							  ))}
					</Carousel>
				</div>
			) : (
				<div className="2xl:-me-14 grid grid-cols-1 gap-3">
					{isLoading && !data?.length ? (
						<CategoryListFeedLoader limit={8} />
					) : (
						data
							?.slice(0, 8)
							.map((category) => (
								<CategoryListCard
									key={`category--key${category.id}`}
									category={category}
								/>
							))
					)}
				</div>
			)}

			<div className="heightFull col-span-full row-span-full 2xl:row-auto 2xl:col-span-4 2xl:ms-14">
				<Carousel
					pagination={{
						clickable: true,
					}}
					className="-mx-0"
					buttonClassName="hidden"
				>
					{heroBanner?.map((banner: any) => (
						<SwiperSlide key={`banner--key${banner.id}`}>
							<BannerCard
								banner={banner}
								href={`${ROUTES.COLLECTIONS}/${banner.slug}`}
								className="xl:h-full"
							/>
						</SwiperSlide>
					))}
				</Carousel>
			</div>
		</div>
	);
};

export default HeroWithCategory;
