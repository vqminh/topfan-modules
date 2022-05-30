import React from "react";
import InputBase, { Props } from "./input-base";

export interface InputProps extends Props<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    className = "block",
    labelKey,
    label,
    name,
    errorKey,
    placeholderKey,
    variant = "normal",
    shadow = false,
    type = "text",
    inputClassName,
    required,
    ...rest
  } = props;

  return (
    <InputBase
      {...props}
      render={({ rootClassName, placeholder }) => (
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          // @ts-ignore
          placeholder={placeholder}
          className={errorKey ? `${rootClassName} border border-red-500` : rootClassName}
          autoComplete="off"
          spellCheck="false"
          aria-invalid={errorKey ? "true" : "false"}
          {...rest}
        />
      )}
    />
  );
});

export default Input;
