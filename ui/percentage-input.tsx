import { NumberFormatInput } from "./number-format-input";

import { Controller, Path, UseFormClearErrors } from "react-hook-form";
import { Control } from "react-hook-form/dist/types";
import { UseFormSetValue } from "react-hook-form/dist/types/form";

export function PercentageInput({
  name,
  setValue,
  control,
  clearErrors,
  required,
  className,
  labelKey,
  variant,
  shadow,
}: {
  name: Path<any>;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  clearErrors: UseFormClearErrors<any>;
  required?: boolean;
  labelKey?: string;
  className?: string;
  variant?: string;
  shadow?: boolean;
}) {
  function onChange(value: string) {
    if (+value > 100) {
      value = "100";
    }
    setValue(name, value);
    clearErrors(name);
  }
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required!! ? "forms:error-required" : false }}
      render={({ field: { value }, fieldState: { error } }) => (
        <NumberFormatInput
          name={name}
          labelKey={labelKey!! ? labelKey : `forms:label-${name}`}
          errorKey={error?.message}
          className={""}
          value={value as string}
          onInputChange={onChange}
          rootClassName={className!! ? className : ""}
          required={required}
          variant={variant}
          shadow={shadow}
          type={"text"}
          format={"###%"}
        />
      )}
    />
  );
}

export default PercentageInput;
