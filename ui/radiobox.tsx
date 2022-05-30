import React from "react";
import { useTranslation } from "next-i18next";

interface RadioBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactElement;
  labelKey?: string;
}

export const RadioBox = React.forwardRef<HTMLInputElement, RadioBoxProps>(
  ({ className, label, labelKey, ...rest }, ref) => {
    const { t } = useTranslation("forms");
    return (
      <label
        className={`group flex items-center text-heading text-sm cursor-pointer ${className}`}
      >
        <input
          type="radio"
          className="form-radio w-5 h-5 border border-gray-300 text-heading rounded-full cursor-pointer transition duration-500 ease-in-out focus:ring-offset-0 hover:border-heading focus:outline-none focus:ring-0 focus-visible:outline-none checked:bg-accent checked:focus:bg-accent"
          ref={ref}
          {...rest}
        />
        <span className="ms-2 text-sm text-heading relative">
          {labelKey ? t(labelKey) : label}
        </span>
      </label>
    );
  }
);
