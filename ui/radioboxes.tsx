import React from "react";
import InputBase from "./input-base";
import { Controller } from "react-hook-form";
import { RadioBox } from "./radiobox";
import { CheckBoxesProps } from "./checkboxes";

const RadioBoxes: React.FC<CheckBoxesProps<any>> = (props) => {
  const {
    name,
    labelKey,
    label,
    options,
    control,
    getValues,
    setValue,
    className,
    ...rest
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <InputBase
          {...rest}
          className={className}
          labelKey={labelKey || `forms:label-${name}`}
          label={label}
        >
          {options.map((o) => (
            <RadioBox
              key={o.value}
              name={o.name}
              label={o.name}
              className="mt-1"
              checked={o.value === field.value}
              value={o.value}
              onChange={(event) => setValue(name, event.target.value)}
            />
          ))}
        </InputBase>
      )}
    />
  );
};

export default RadioBoxes;
