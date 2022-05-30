import React from "react";
import { useTranslation } from "next-i18next";
import NumberFormat, {InputAttributes, NumberFormatPropsBase} from "react-number-format";
import cn from "classnames";
import InputBase from "./input-base";

export interface Props<T> extends NumberFormatPropsBase<T> {
  name: string;
  className?: string;
  inputClassName?: string;
  labelKey?: string;
  errorKey?: string;
  value?: string;
  rootClassName?: string;
  required?: boolean;
  variant?: string;
  shadow?: boolean;
  disabled?: boolean;
  onInputChange: (value: string) => void;
}

const classes = {
  root: "py-2 px-4 md:px-5 w-full appearance-none transition duration-150 ease-in-out border text-input text-xs lg:text-sm font-body rounded-md placeholder-body min-h-12 transition duration-200 ease-in-out",
  normal:
    "bg-primary border-gray-400 focus:shadow focus:bg-primary focus:border-primary",
  solid:
    "bg-primary border-gray-400 focus:outline-none focus:border-heading h-11 md:h-12",
  outline: "border-gray-400 focus:border-primary",
  shadow: "focus:shadow",
};

export const NumberFormatInput: React.FC<Props<InputAttributes>> = ({
  name,
  labelKey,
  errorKey,
  rootClassName = "mb-4",
  value,
  className,
  variant = "normal",
  shadow = false,
  required,
  onInputChange,
  ...rest
}) => {
  const { t } = useTranslation();
  const inputClassName = cn(
    classes.root,
    {
      [classes.normal]: variant === "normal",
      [classes.solid]: variant === "solid",
      [classes.outline]: variant === "outline",
    },
    {
      [classes.shadow]: shadow,
    },
    className
  );

  return (
    <InputBase
      className={rootClassName}
      labelKey={labelKey}
      required={required}
      errorKey={errorKey}
    >
      <NumberFormat
        className={
          errorKey ? `${inputClassName} border border-red-500` : inputClassName
        }
        placeholder={labelKey ? t(labelKey) : ""}
        value={value}
        onValueChange={(values) => onInputChange(values.value)}
        {...rest}
      />
    </InputBase>
  );
};
