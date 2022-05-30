import InputMask, { Props } from "react-input-mask";
import { InputProps } from "./input";
import React from "react";
import InputBase from "./input-base";
import { Controller, Path, UseFormClearErrors } from "react-hook-form";
import { Control } from "react-hook-form/dist/types";
import { UseFormSetValue } from "react-hook-form/dist/types/form";

export interface MaskedInputProps extends InputProps, Props {
  name: Path<any>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  clearErrors: UseFormClearErrors<any>;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  (props, ref) => {
    const {
      control,
      name,
      errorKey,
      placeholder,
      type = "text",
      required,
      alwaysShowMask = false,
      maskPlaceholder,
        mask
    } = props;

    return (
      <Controller
        control={control}
        name={name}
        rules={{ required: required!! ? "forms:error-required" : false }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <InputBase
            errorKey={error?.message}
            value={value}
            onChange={onChange}
            {...props}
            render={({ rootClassName }) => (
              <InputMask
                alwaysShowMask={alwaysShowMask}
                maskPlaceholder={maskPlaceholder}
                value={value}
                mask={mask}
                onChange={onChange}
              >
                <input
                    id={name}
                    name={name}
                    type={type}
                    ref={ref}
                    placeholder={placeholder}
                    className={
                      errorKey
                          ? `${rootClassName} border border-red-500`
                          : rootClassName
                    }
                    autoComplete="off"
                    spellCheck="false"
                    aria-invalid={errorKey ? "true" : "false"}
                />
              </InputMask>
            )}
          />
        )}
      />
    );
  }
);

export default MaskedInput;
