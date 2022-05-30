import Image from "next/image";
import { assetLoader } from "../../utils/firebase";
import React from "react";
import { useWindowSize } from "react-use";

interface CategoryBannerProps {
  backgroundImage?: string;
  mobileBackgroundImage?: string;
  title?: string;
  className?: string;
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({
  backgroundImage = "/assets/images/category-banner.jpg",
  mobileBackgroundImage = backgroundImage,
  className = "",
  title = "",
}) => {
  let { width } = useWindowSize();

  return (
    <div
      className={`bg-gradient-to-r from-topfan-blue via-topfan-purple to-topfan-pink rounded-md relative flex flex-row ${className}`}
    >
      <div className="flex h-[300px]">
        <Image
          loader={assetLoader}
          src={width < 641 ? mobileBackgroundImage : backgroundImage}
          alt={title}
          width={1800}
          height={570}
          className="rounded-md object-cover"
        />
      </div>
      <div className="absolute top-0 start-0 h-full w-full flex items-center py-2 sm:py-3.5">
        <h2 className="text-3xl lg:text-4xl font-bold text-heading p-8 text-center w-full">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default CategoryBanner;
