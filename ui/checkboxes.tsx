import React, { ChangeEvent, ChangeEventHandler } from "react";
import { Option } from "./sort-list-box";
import InputBase from "./input-base";
import { useTranslation } from "next-i18next";
import { Controller, Path } from "react-hook-form";
import { UseFormReturn } from "react-hook-form/dist/types";
import { LOGGER } from "../utils/logging";
import { UnpackNestedValue } from "react-hook-form/dist/types/form";

export interface CheckBoxesProps<T> extends UseFormReturn<T> {
  labelKey?: string;
  label?: string;
  name: Path<T>;
  options: Option[];
  className?: string;
  required?: boolean;
}

const CheckBoxes: React.FC<CheckBoxesProps<any>> = (props) => {
  const {
    name,
    labelKey,
    label,
    options,
    control,
    getValues,
    setValue,
    clearErrors,
    setError,
    required,
    ...rest
  } = props;
  const { t } = useTranslation();

  const onItemChange: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const values = (getValues(name) || []) as string[];
    const item = event.target.name as string;
    LOGGER(values, item, event.target.checked);
    if (event.target.checked) {
      setValue(name, [...values, item] as UnpackNestedValue<any>);
    } else {
      const remaining = values?.filter(
        (v) => v !== item
      ) as UnpackNestedValue<any>;
      setValue(name, remaining);
      if (!remaining?.length) {
        setError(name, {
          message: "forms:error-required",
        });
        return;
      }
    }
    clearErrors(name);
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? "forms:error-required" : false,
      }}
      render={({ field, fieldState: { error } }) => (
        <InputBase
          {...rest}
          labelKey={labelKey || `forms:label-${name}`}
          label={label}
          errorKey={error?.message}
        >
          {options.map((o) => (
            <label
              key={o.value}
              className={`group flex items-center text-heading text-sm cursor-pointer`}
            >
              <input
                type="checkbox"
                className="form-checkbox w-5 h-5 border border-gray-300 rounded cursor-pointer transition duration-500 ease-in-out focus:ring-offset-0 hover:border-heading focus:outline-none focus:ring-0 focus-visible:outline-none checked:bg-heading mb-1"
                name={o.name}
                value={o.value}
                checked={field.value?.includes(o.value)}
                onChange={onItemChange}
              />
              <span className="ms-4 -mt-0.5">
                {!!o.name ? t(o.name) : o.value}
              </span>
            </label>
          ))}
        </InputBase>
      )}
    />
  );
};

export default CheckBoxes;
