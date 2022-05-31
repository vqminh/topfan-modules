import BrandCard from "../common/brand-card";
import SectionHeader from "../common/section-header";
import BrandCardLoader from "../../ui/loaders/brand-card-loader";
import { useBrandsQuery } from "src/framework/basic-rest/brand/get-all-brands";
import Alert from "../../ui/alert";

interface BrandProps {
	sectionHeading: string;
	className?: string;
}

const BrandGridBlock: React.FC<BrandProps> = ({
	className = "mb-12 md:mb-14 xl:mb-16",
	sectionHeading,
}) => {
	const { data, isLoading, error } = useBrandsQuery({
		limit: 10,
	});
	const brands = data?.brandsGrid;
	return (
		<div className={className}>
			<SectionHeader sectionHeading={sectionHeading} />
			{error ? (
				<Alert message={error?.message} />
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3 lg:gap-5 xl:gap-7">
					{isLoading
						? Array.from({ length: 16 }).map((_, idx) => (
								<BrandCardLoader key={idx} uniqueKey={`top-brand-${idx}`} />
						  ))
						: brands?.map((brand) => (
								<BrandCard key={`brand--key${brand.id}`} brand={brand} />
						  ))}
				</div>
			)}
		</div>
	);
};

export default BrandGridBlock;
