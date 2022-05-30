import type { FC } from "react";
import React from "react";
import Link from "../../ui/link";

export interface IconListItemData {
  icon: JSX.Element;
  hidden?: boolean;
  name: string;
  slug?: string;
  description: string;
}

interface Props {
  className?: string;
  data: IconListItemData;
}

const IconListItem: FC<Props> = ({ className, data }) => {
  const { icon, name, slug, description } = data;
  return (
    <div className={`flex pb-7 ${className || ""}`}>
      <div className="flex flex-shrink-0 justify-center items-center p-1.5 border rounded-md border-gray-300 w-10 h-10">
        {icon}
      </div>
      <div className="flex flex-col ps-3 2xl:ps-4">
        <div className="text-sm">{name}</div>
        <h5 className="text-sm font-bold text-heading">
          {slug?.startsWith("/") && (
            <Link href={slug} className="text-sm mt-0">
              {description}
            </Link>
          )}
          {!!slug && !slug.startsWith("/") && (
            <a href={slug} target="_blank" className="text-sm mt-0">
              {description}
            </a>
          )}
          {!slug && description}
        </h5>
      </div>
    </div>
  );
};

export default IconListItem;
