import React, { useState } from "react";
import cn from "classnames";
import { useTranslation } from "next-i18next";
import InputBase, { Props } from "./input-base";

export interface TextAreaProps extends Props<HTMLTextAreaElement> {
  rows?: number;
}

const variantClasses = {
  normal:
    "bg-primary border border-gray-400 focus:bg-primary focus:shadow focus:outline-none focus:border-heading placeholder-body",
  solid:
    "bg-primary border border-gray-400 focus:bg-primary focus:border-primary",
  outline: "border border-gray-300 focus:border-primary",
};

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => {
    const { t } = useTranslation();
    const {
      className,
      labelKey,
      label,
      name,
      placeholderKey,
      errorKey,
      variant = "normal",
      shadow = false,
      inputClassName,
      required,
      rows = 5,
      maxLength,
      ...rest
    } = props;

    const [count, setCount] = useState(0);
    return (
      <InputBase
        {...props}
        render={({ title }) => (
          <textarea
            id={name}
            name={name}
            className={cn(
              "px-4 py-3 flex items-center w-full rounded appearance-none transition duration-300 ease-in-out text-heading text-sm focus:outline-none focus:ring-0",
              shadow && "focus:shadow",
              variantClasses[variant],
              inputClassName,
              {
                "border border-red-500": errorKey!!
              }
            )}
            onKeyUp={(e) => setCount(e.currentTarget.value.length)}
            autoComplete="off"
            spellCheck="false"
            rows={rows}
            ref={ref}
            maxLength={maxLength}
            // @ts-ignore
            placeholder={placeholderKey ? t(placeholderKey) : title}
            {...rest}
          />
        )}
        footer={
          maxLength ? (
            <div className="text-sm absolute bottom-1 right-1">
              {maxLength - count}
            </div>
          ) : null
        }
      />
    );
  }
);

export default TextArea;
