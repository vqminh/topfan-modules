import Link from "next/link";
import Image from "next/image";
import Text from "../../ui/text";
import { Category } from "src/framework/basic-rest/types";
import { useTranslation } from "next-i18next";
import { assetLoader } from "../../utils/firebase";
import { getThumbnail } from "../../utils/id";
import React from "react";

interface Props {
  category: Category;
}

const CategoryCard: React.FC<Props> = ({ category }) => {
  const { name, products } = category;
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col border border-gray-300 rounded-lg p-4 lg:p-5 xl:p-7">
      <Text
        variant="heading"
        className="capitalize -mt-0.5 lg:-mt-1 xl:-mt-0 mb-2.5 lg:mb-3.5"
      >
        {name}
      </Text>
      <div className="grid grid-cols-3 gap-2.5 xl:gap-3">
        {products?.slice(0, 3)?.map((product) => {
          const { photo, slug } = product;

          return (
            <Link href={`/${slug}`} key={slug}>
              <a className="flex rounded-md overflow-hidden">
                <Image
                  src={getThumbnail(photo)}
                  loader={assetLoader}
                  alt={name || t("text-category-thumbnail")}
                  width={165}
                  height={165}
                  className="bg-gray-300 object-cover rounded-md transition duration-300 ease-in-out transform hover:scale-110"
                />
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryCard;
