import { fadeInTop } from "../../motion/fade-in-top";
import { useWindowSize } from "../../utils/use-window-size";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { Loading } from "../../ui/loading";
import Link from "../../ui/link";
import Text from "../../ui/text";
import FilterIcon from "../icons/filter-icon";
import SortListBox, { Option } from "../../ui/sort-list-box";
import { Drawer } from "./drawer/drawer";
import FilterSidebar from "../../../src/components/shop/filter-sidebar";
import { useUI } from "../../../src/contexts/ui.context";
import { useRouter } from "next/router";
import Input from "../../ui/input";
import { useInfiniteQuery } from "react-query";
import { Page } from "../../../src/framework/basic-rest/utils/shopify-product-utils";
import { reportError } from "../../utils/logging";
import Button from "../../ui/button";
import {TData} from "../../utils/firestore";

export interface Action<T> {
  onClick(
    item: T,
    id: string,
    options: {
      refresh: () => any;
    }
  ): PromiseLike<any>;

  type?: "danger" | "success";
}

export interface Cell<T> {
  hidden?: boolean;
  hiddenFn?: (item: T, id: string) => boolean;
  header?: string;
  headerKey?: string;
  accessor?: keyof T | "id";

  renderItem?(
    item: T,
    id: string,
    options: {
      refresh: () => any;
    }
  ): JSX.Element | string | undefined | null;

  href?(item: T, id: string): string;

  action?: Action<T>;
}

interface Props<T> {
  titleKey?: string;
  title?: string;
  subtitle?: string;
  searchKey?: string;
  cells: Cell<T>[];
  loadData: (params: {
    sort?: string;
    search?: string;
    after?: any;
  }) => Promise<Page<TData<T>>>;
  options?: Option[];
  actions?: { content: string; onClick: () => void }[];
  filters?: string[];
}

let refreshId = 0;

function Table<T>({
  titleKey,
  title,
  subtitle,
  cells,
  searchKey,
  loadData,
  filters,
  options,
  actions,
}: Props<T>): JSX.Element {
  const { width } = useWindowSize();
  const { t } = useTranslation();
  const input = React.createRef<HTMLInputElement>();
  const { openFilter, displayFilter, closeFilter } = useUI();
  const router = useRouter();
  const { pathname, query } = router;
  const sort = query?.sort as string;
  const [search, setSearch] = useState(query?.search as string);

  const {
    data,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery<Page<TData<T>>, Error>(
    [titleKey, sort],
    ({ queryKey: [, sort], pageParam }) =>
      loadData({
        sort: sort as string,
        search: query?.search as string,
        after: pageParam,
      }),
    {
      getNextPageParam: ({ next }) => next,
      enabled: false,
      retry: false,
    }
  );

  useEffect(() => {
    refetch().catch(reportError);
  }, [sort]);

  if (isLoading || !data) {
    return <Loading error={error?.message} />;
  }

  const linkClassName =
    "text-heading text-sm leading-4 cursor-pointer px-4 py-2.5 inline-block rounded-md hover:bg-secondary";

  function renderItemContent(cell: Cell<T>, item: TData<T>) {
    const { accessor, renderItem, href, action, hiddenFn } = cell;
    const { data, id } = item;
    if (!!hiddenFn && hiddenFn(data, id)) {
      return null;
    }
    const content = accessor
      ? accessor === "id"
        ? id
        : data[accessor] as unknown as string
      : renderItem?.(data, id, { refresh }) || "";
    const link = href?.(data, id);
    if (!!link) {
      const className = "underline hover:no-underline";
      if (link.indexOf(":") === -1) {
        return (
          <Link href={link} className={className}>
            {content}
          </Link>
        );
      } else {
        return (
          <a href={link} target="_blank" className={className}>
            {content}
          </a>
        );
      }
    }
    if (action) {
      const { onClick, type } = action;
      const bgClassName = type === "danger" ? "bg-red-500" : "bg-heading";
      return (
        <a
          onClick={() =>
            onClick(item.data, item.id, {
              refresh,
            })
          }
          className={`${bgClassName} ${linkClassName}`}
        >
          {content}
        </a>
      );
    }
    return content;
  }

  const visibleCells = cells.filter((c) => !!c && !c.hidden);

  function refresh() {
    if (refreshId) {
      clearTimeout(refreshId);
    }
    refreshId = setTimeout(refetch, 500);
  }

  const fetchNextPageButton = (
    <Button
      loading={isFetchingNextPage}
      disabled={isFetchingNextPage}
      onClick={() => fetchNextPage()}
      variant="slim"
    >
      {t("button-load-more")}
    </Button>
  );
  return (
    <>
      <div className="md:flex justify-between items-center mb-7">
        {(!!titleKey || title) && (
          <Text
            variant="subHeading"
            className={`${filters ? "hidden" : ""} lg:inline-flex pb-1`}
          >
            {!!titleKey ? t(titleKey) : title}
          </Text>
        )}
        {!!filters && (
          <button
            className="lg:hidden text-heading text-sm px-4 py-2 font-semibold border border-gray-300 rounded-md flex items-center transition duration-200 ease-in-out focus:outline-none hover:bg-gray-200"
            onClick={openFilter}
          >
            <FilterIcon />
            <span className="ps-2.5">{t("text-filters")}</span>
          </button>
        )}
        <div className="md:flex items-center justify-end">
          {!!subtitle && (
            <div className="md:flex-shrink-0 text-body text-xs md:text-sm leading-4 pe-4 md:me-6 ps-2 hidden lg:block">
              {subtitle}
            </div>
          )}
          {searchKey && (
            <Input
              placeholder={t(searchKey)}
              className="md:mr-2 my-2"
              value={search}
              ref={input}
              type="search"
              onChange={async ({ target }) => {
                setSearch(target.value);
                const { search, ...restQuery } = query;
                await router.push(
                  {
                    pathname,
                    query: {
                      ...restQuery,
                      search: target.value,
                    },
                  },
                  undefined,
                  { scroll: false }
                );
                refresh();
              }}
            />
          )}
          {!!options && <SortListBox options={options} />}
          {actions?.map((action, index) => (
            <button
              key={String(index)}
              className="md:ml-2 my-2 bg-heading text-sm leading-4 text-white px-4 py-2.5 inline-block rounded-md hover:text-white hover:bg-gray-600"
              onClick={action.onClick}
            >
              {action.content}
            </button>
          ))}
        </div>
        {!!filters && (
          <Drawer
            placement="left"
            open={displayFilter}
            onClose={closeFilter}
            handler={false}
            showMask={true}
            level={null}
            contentWrapperStyle={{ left: 0 }}
          >
            <FilterSidebar />
          </Drawer>
        )}
      </div>
      <motion.div
        layout
        initial="from"
        animate="to"
        exit="from"
        //@ts-ignore
        variants={fadeInTop(0.35)}
        className={`w-full flex flex-col`}
      >
        {width >= 1025 ? (
          <table>
            <thead className="text-sm lg:text-base">
              <tr>
                {visibleCells.map(({ headerKey, header }, index) => {
                  const thClass =
                    index === 0
                      ? "first:rounded-ts-md"
                      : index === cells.length - 1
                      ? "last:rounded-te-md"
                      : "lg:text-center";
                  return (
                    <th
                      key={String(index)}
                      className={`bg-secondary p-4 text-heading font-semibold text-start ${thClass}`}
                    >
                      {headerKey ? t(headerKey) : header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="text-sm lg:text-base">
              {data.pages.map((page) =>
                page.data.map((item: TData<T>) => {
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-bgSecondary last:border-b-0"
                    >
                      {visibleCells.map((cell, index) => {
                        const tdClass =
                          index === 0
                            ? ""
                            : index === cells.length - 1
                            ? "text-end"
                            : "lg:text-center text-heading";
                        return (
                          <td
                            key={String(index)}
                            className={`px-4 py-5 text-start ${tdClass}`}
                          >
                            {renderItemContent(cell, item)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
            {hasNextPage && (
              <tfoot>
                <tr>
                  <td>
                    <div className="text-center pt-8 xl:pt-14">
                      {fetchNextPageButton}
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        ) : (
          <div className="w-full space-y-4">
            {data.pages.map((page) =>
              page.data.map((item: TData<T>) => (
                <ul
                  key={item.id}
                  className="text-sm font-semibold text-heading bg-primary dark:bg-secondary border border-bgSecondary rounded-md flex flex-col px-4 pt-5 pb-6 space-y-5"
                >
                  {visibleCells.map((cell, index) => {
                    const { headerKey, header } = cell;
                    return (
                      <li
                        key={String(index)}
                        className="flex items-center justify-between"
                      >
                        {headerKey ? t(headerKey) : header}
                        <span className="font-normal">
                          {renderItemContent(cell, item)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ))
            )}
            {hasNextPage && (
              <div className="text-center pt-8 xl:pt-14">
                {fetchNextPageButton}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}

export default Table;
