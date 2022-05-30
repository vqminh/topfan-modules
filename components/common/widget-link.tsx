import type { FC } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useUI } from "../../../src/contexts/ui.context";

interface Props {
  className?: string;
  data: {
    widgetTitle?: string;
    lists: {
      hidden?: (isIdol: boolean, isAdmin: boolean) => boolean;
      path?: string;
      href?: string;
      title: string;
      icon?: any;
    }[];
  };
}

const WidgetLink: FC<Props> = ({ className, data }) => {
  const { widgetTitle, lists } = data;
  const { t } = useTranslation("footer");
  const { isIdol, isAdmin } = useUI();

  return (
    <div className={`${className}`}>
      <h4 className="text-heading text-sm md:text-base xl:text-lg font-semibold mb-5 2xl:mb-6 3xl:mb-7">
        {t(`${widgetTitle}`)}
      </h4>
      <ul className="text-xs lg:text-sm text-body flex flex-col space-y-3 lg:space-y-3.5">
        {lists
          .filter((list) => !list.hidden?.(isIdol, isAdmin))
          .map((list, index) => (
            <li key={String(index)} className="flex items-baseline">
              {list.icon && (
                <span className="me-3 relative top-0.5 lg:top-1 text-sm lg:text-base">
                  {list.icon}
                </span>
              )}
              {!!list.path && (
                <Link href={list.path}>
                  <a className="transition-colors duration-200 hover:text-black dark:hover:text-secondary">
                    {t(`${list.title}`)}
                  </a>
                </Link>
              )}
              {!!list.href && (
                <a
                  className="transition-colors duration-200 hover:text-black dark:hover:text-secondary"
                  href={list.href}
                  target="_blank"
                >
                  {t(`${list.title}`)}
                </a>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default WidgetLink;
