import BannerCard from "../common/banner-card";
import SectionHeader from "../common/section-header";
import ProductCard from "../../../src/components/product/product-card";
import ProductCardListSmallLoader from "../../ui/loaders/product-card-small-list-loader";
import { useOnSellingProductsQuery } from "../../../src/framework/basic-rest/product/get-all-on-selling-products";
import { homeThreeProductsBanner as banner } from "../../../src/framework/basic-rest/static/banner";
import Alert from "../../ui/alert";
import { ROUTES } from "../../../src/utils/routes";
import React from "react";

interface ProductsProps {
	sectionHeading: string;
	categorySlug?: string;
	className?: string;
	variant?: "default" | "reverse";
}

const BannerWithProducts: React.FC<ProductsProps> = ({
	sectionHeading,
	categorySlug,
	variant = "default",
	className = "mb-12 md:mb-14 xl:mb-16",
}) => {
	const { data, isLoading, error } = useOnSellingProductsQuery({
		limit: 10,
	});

	return (
		<div className={className}>
			<SectionHeader
				sectionHeading={sectionHeading}
				categorySlug={categorySlug}
			/>
			{error ? (
				<Alert message={error?.message} />
			) : (
				<div className="grid grid-cols-4 gap-3 lg:gap-5 xl:gap-7">
					{variant === "reverse" ? (
						<BannerCard
							banner={banner[1]}
							href={`${ROUTES.COLLECTIONS}/${banner[1].slug}`}
							className="hidden 3xl:block"
							effectActive={true}
						/>
					) : (
						<BannerCard
							banner={banner[0]}
							href={`${ROUTES.COLLECTIONS}/${banner[0].slug}`}
							className="hidden 3xl:block"
							effectActive={true}
						/>
					)}
					<div
						className={`col-span-full 3xl:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5 xl:gap-7 ${
							variant === "reverse" ? "row-span-full" : ""
						}`}
					>
						{isLoading
							? Array.from({ length: 9 }).map((_, idx) => (
									<ProductCardListSmallLoader
										key={idx}
										uniqueKey={`on-selling-${idx}`}
									/>
							  ))
							: data?.map((product) => (
									<ProductCard
										key={product.idol}
										product={product}
										imgWidth={176}
										imgHeight={176}
										variant="listSmall"
									/>
							  ))}
					</div>
				</div>
			)}
		</div>
	);
};

export default BannerWithProducts;
