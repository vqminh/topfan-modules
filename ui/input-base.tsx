import cn from "classnames";
import React, { InputHTMLAttributes } from "react";
import { useTranslation } from "next-i18next";

export interface RenderProps {
  rootClassName: string;
  title: string;
  placeholder: string;
}

export interface Props<T> extends InputHTMLAttributes<T> {
  inputClassName?: string;
  labelKey?: string;
  label?: string;
  placeholderKey?: string;
  errorKey?: string;
  shadow?: boolean;
  variant?: "normal" | "solid" | "outline";
}

export interface BaseProps<T> extends Props<T> {
  render?: (props: RenderProps) => JSX.Element;
  footer?: JSX.Element | null;
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
const InputBase: React.FC<BaseProps<any>> = ({
  className = "block",
  labelKey,
  label,
  placeholderKey,
  name,
  errorKey,
  variant = "normal",
  shadow = false,
  inputClassName,
  required,
  footer,
  render,
  children,
}) => {
  const rootClassName = cn(
    classes.root,
    {
      [classes.normal]: variant === "normal",
      [classes.solid]: variant === "solid",
      [classes.outline]: variant === "outline",
    },
    {
      [classes.shadow]: shadow,
    },
    inputClassName
  );
  const { t } = useTranslation();
  const title = label ? label : labelKey ? t(labelKey) : "";
  return (
    <div className={className}>
      {title && (
        <label
          htmlFor={name}
          className="block text-heading font-semibold text-sm leading-none mb-3 cursor-pointer"
        >
          {title}
          {required ? " *" : ""}
        </label>
      )}
      {render?.({
        rootClassName,
        title,
        placeholder: placeholderKey ? t(placeholderKey) : title,
      })}
      {children}
      {errorKey && <p className="pb-4 my-2 text-xs text-red-500">{t(errorKey)}</p>}
      {footer}
    </div>
  );
};

export default InputBase;
