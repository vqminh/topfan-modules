import Link from "../../../src/components/ui/link";
import Image from "next/image";
import { ROUTES } from "../../../src/utils/routes";
import { assetLoader } from "../../utils/firebase";
import { Product } from "../../../src/framework/basic-rest/types";
import React from "react";

type SearchProductProps = {
  item: Product;
};

const SearchProduct: React.FC<SearchProductProps> = ({ item }) => {
  const { displayName, photo, intro, slug } = item;
  return (
    <Link
      href={`${ROUTES.IDOLS}/${slug}`}
      className="group w-full h-auto flex justify-start items-center"
    >
      <div className="relative flex w-24 h-24 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer me-4">
        <Image
          src={photo.path}
          width={96}
          height={96}
          loading="eager"
          alt={displayName}
          unoptimized={true}
          loader={assetLoader}
          className="bg-gray-200 object-cover"
        />
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <h3 className="text-sm text-heading mb-2">{displayName}</h3>
        <div className="break-words text-heading font-semibold text-sm">{intro}</div>
      </div>
    </Link>
  );
};

export default SearchProduct;
