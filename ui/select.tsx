import React from "react";
import { Option } from "./sort-list-box";
import InputBase, { Props } from "./input-base";
import { useTranslation } from "next-i18next";

export interface SelectProps extends Props<HTMLSelectElement> {
  options: Option[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    const {
      className = "block",
      labelKey,
      name,
      errorKey,
      placeholderKey,
      variant = "normal",
      shadow = false,
      inputClassName,
      required,
      options,
      ...rest
    } = props;
    const { t } = useTranslation();

    return (
      <InputBase
        {...props}
        render={({ rootClassName }) => (
          <select
            id={name}
            name={name}
            ref={ref}
            // @ts-ignore
            className={errorKey ? `${rootClassName} border border-red-500` : rootClassName}
            aria-invalid={errorKey ? "true" : "false"}
            {...rest}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {!!o.name ? t(o.name) : o.value}
              </option>
            ))}
          </select>
        )}
      />
    );
  }
);

export default Select;
