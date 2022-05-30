import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useUI } from "../../../src/contexts/ui.context";
import Input from "../../ui/input";
import Button from "../../ui/button";
import { useForm } from "react-hook-form";
import MoneyInput from "../../ui/money-input";
import Text from "../../ui/text";

export interface ConfirmationDataType {
  header?: string;
  message?: string;
  mode?: "text" | "money" | "confirm";
  fields?: {
    name: string;
    message: string;
    mode: string;
    required?: boolean;
    value?: string | number;
  }[];
  onConfirm: (confirm?: boolean | string | number | any) => Promise<void>;
}

const ConfirmationForm: React.FC<{ children?: React.ReactNode }>= () => {
  const { t } = useTranslation();
  const { modalData, closeModal } = useUI();
  const pushData = modalData.data as ConfirmationDataType;
  const [isLoading, setLoading] = useState(false);
  const { header, message, mode, onConfirm, fields } = pushData;

  const inputs = fields || [
    { name: "value", message, mode, required: true, value: undefined },
  ];

  const {
    register,
    setValue,
    clearErrors,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const initValues = {} as any;
    inputs.forEach((it) => {
      initValues[it.name] = it.value;
    });
    reset(initValues);
  }, []);

  async function success(data: any) {
    setLoading(true);
    if (mode === "confirm") {
      await onConfirm(true);
    } else {
      await onConfirm(data?.value ?? data);
    }
    closeModal();
  }

  return (
    <div className="rounded-lg bg-primary">
      <div className="lg:flex-row w-full md:w-[400px] lg:w-[400px] mx-auto overflow-hidden pb-5 pt-3 pl-5 pr-5">
        <h2 className="mb-2 sm:mb-3 text-heading text-xl leading-7 lg:leading-loose">
          {header!! ? header : "Xác nhận"}
        </h2>
        <form
          onSubmit={handleSubmit(success)}
          className="flex flex-col justify-center"
          noValidate
        >
          <div className="flex flex-col space-y-3.5">
            {inputs.map(({ name, message, mode, required }) => {
              return (
                <>
                  <Text>{message!! ? message : t("common:text-confirm")}</Text>
                  {mode === "text" && (
                    <Input
                      type="text"
                      variant="solid"
                      {...register(name, {
                        required:
                          (required ?? true) && `${t("forms:error-required")}`,
                      })}
                      errorKey={errors[name]?.message}
                    />
                  )}
                  {mode === "money" && (
                    <MoneyInput
                      setValue={setValue}
                      clearErrors={clearErrors}
                      name={name}
                      labelKey={""}
                      control={control}
                      required={required ?? true}
                      variant="solid"
                    />
                  )}
                </>
              );
            })}

            <div className="flex items-center justify-between space-s-3 sm:space-s-4">
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="h-11 md:h-12 w-full mt-1.5 bg-green-400"
              >
                {mode === "confirm" ? "Yes" : "Ok"}
              </Button>
              <Button
                loading={isLoading}
                disabled={isLoading}
                className="h-11 md:h-12 w-full mt-1.5"
                onClick={async () => {
                  setLoading(true);
                  if (mode === "confirm") {
                    await onConfirm(false);
                  }
                  setLoading(false);
                  closeModal();
                }}
              >
                {mode === "confirm" ? "No" : t("common:text-close")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmationForm;
