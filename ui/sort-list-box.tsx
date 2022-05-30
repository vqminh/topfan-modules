import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { HiCheck, HiOutlineSelector } from "react-icons/hi";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export type Option = {
  name?: string;
  value: string | number;
  render?: (name?: string) => JSX.Element;
};

export default function SortListBox({ options }: { options: Option[] }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { pathname, query } = router;
  const currentSelectedItem = query?.sort
    ? options.find((o) => o.value === query.sort)!
    : options[0];
  const [selectedItem, setSelectedItem] = useState<Option>(currentSelectedItem);
  useEffect(() => {
    setSelectedItem(currentSelectedItem);
  }, [query?.sort]);

  async function handleItemClick(values: Option) {
    setSelectedItem(values);
    const { sort, ...restQuery } = query;
    await router.push(
      {
        pathname,
        query: {
          ...restQuery,
          ...(values.value !== options[0].value ? { sort: values.value } : {}),
        },
      },
      undefined,
      { scroll: false }
    );
  }

  return (
    <Listbox value={selectedItem} onChange={handleItemClick}>
      {({ open }) => (
        <div className="relative md:ms-2 lg:ms-0 z-10 min-w-[180px]">
          <Listbox.Button className="border border-gray-300 text-heading text-[13px] md:text-sm font-semibold  relative w-full py-2 ps-3 pe-10 text-start bg-primary rounded-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm cursor-pointer">
            <span className="block truncate">{t(selectedItem.name || selectedItem.value as string)}</span>
            <span className="absolute inset-y-0 end-0 flex items-center pe-2 pointer-events-none">
              <HiOutlineSelector
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              static
              className="absolute w-full py-1 mt-1 overflow-auto bg-primary rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none text-sm"
            >
              {options?.map((option, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `${active ? "bg-secondary" : "text-primary"}
                          cursor-default select-none relative py-2 ps-10 pe-4`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`${
                          selected ? "font-medium" : "font-normal"
                        } block truncate`}
                      >
                        {t(option.name || option.value as string )}
                      </span>
                      {selected ? (
                        <span
                          className={`${active ? "text-amber-600" : ""}
                                check-icon absolute inset-y-0 start-0 flex items-center ps-3`}
                        >
                          <HiCheck className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
