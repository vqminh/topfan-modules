import { NumberFormatInput } from "./number-format-input";

import { Controller, Path, UseFormClearErrors } from "react-hook-form";
import { Control } from "react-hook-form/dist/types";
import { UseFormSetValue } from "react-hook-form/dist/types/form";
import NumberFormat from "react-number-format";
import React from "react";

export function MoneyInput({
  name,
  setValue,
  control,
  clearErrors,
  required,
  className,
  labelKey,
  variant,
  shadow,
  disabled,
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
  disabled?: boolean;
}) {
  function onChange(value: string) {
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
          labelKey={labelKey}
          errorKey={error?.message}
          value={value as string}
          onInputChange={onChange}
          rootClassName={className!! ? className : ""}
          required={required}
          variant={variant}
          shadow={shadow}
          allowNegative={false}
          decimalSeparator="."
          suffix=" đ"
          thousandSeparator={true}
          disabled={disabled}
        />
      )}
    />
  );
}

export default MoneyInput;

export function formatMoney(amount: number, className?: string) {
  return (
    <NumberFormat
      value={Math.floor(amount)}
      displayType="text"
      className={className}
      thousandSeparator
      suffix=" đ"
    />
  );
}

export function MoneyText({
  amount,
  className,
}: {
  amount: number | undefined;
  className?: string;
}) {
  return (
    <NumberFormat
      value={amount}
      displayType="text"
      className={className}
      thousandSeparator
      suffix=" đ"
    />
  );
}
