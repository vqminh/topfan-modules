import { Banner } from "../../ui/banner";
import Button from "../../ui/button";
import { FormProvider, Path } from "react-hook-form";
import {
  SubmitHandler,
  UnpackNestedValue,
} from "react-hook-form/dist/types/form";
import { useTranslation } from "next-i18next";
import React, {
  MouseEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { fadeInTop } from "../../motion/fade-in-top";
import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form/dist/types";
import cn from "classnames";
import { LOGGER } from "../../utils/logging";

export interface FormAction {
  content: any;
  type?: "danger" | "success";
  onClick: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

interface Props<T> {
  titleKey?: string;
  title?: string;
  onSubmit?: SubmitHandler<T>;
  actions?: FormAction[];
  children?: ReactNode;
  className?: string;
  buttonTitle?: string;
  successMessageKey?: string;
  formContext: UseFormReturn<T>;
}

export default function Form<T>({
  title,
  titleKey,
  onSubmit,
  actions,
  children,
  buttonTitle,
  successMessageKey,
  formContext,
  className = "",
}: Props<T>) {
  const { t } = useTranslation();
  const {
    handleSubmit,
    setError,
    register,
    control,
    formState: { isSubmitSuccessful, isSubmitting, errors},
  } = formContext;
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);
  const formRef = React.createRef<HTMLFormElement>();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onError = (e: Error) => {
    LOGGER(e);
    const { name: errorCode, message } = e;
    const name = control._fields[errorCode] ? errorCode : "Error";
    setError(
      name as Path<T>,
      {
        message,
        type: "validate",
      },
      { shouldFocus: true }
    );
    formRef.current?.scrollIntoView();
  };

  const trySubmit = async (values: UnpackNestedValue<T>) => {
    try {
      await onSubmit?.(values);
    } catch (e: any) {
      onError(e);
      LOGGER(values);
    }
  };

  const form = (
    <FormProvider {...formContext}>
      <form
        ref={formRef}
        onSubmit={handleSubmit(trySubmit)}
        className={`w-full mx-auto flex flex-col justify-center ${className}`}
        noValidate
      >
        <input {...register("Error" as Path<T>)} type="hidden" />
        {isSubmitSuccessful && (
          <Banner messageKey={successMessageKey || "text-update-success"} />
        )}
        {!isSubmitSuccessful && !!(errors as any)?.Error && (
          <Banner message={(errors as any)?.Error?.message} type="danger" />
        )}
        {!isSubmitSuccessful && (
          <div className="flex flex-col space-y-4 sm:space-y-5">
            {children}
            <div
              className={cn("relative", {
                "px-0 pb-2 lg: xl:max-w-screen-xl mx-auto flex flex-col md:flex-row w-full":
                  actions?.length,
              })}
            >
              {!!onSubmit && (
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className={
                    actions?.length
                      ? "h-12 mt-3 w-full"
                      : "h-11 md:h-12 w-full mt-2"
                  }
                >
                  {buttonTitle || t("common:button-submit")}
                </Button>
              )}
              {actions?.map((action, index) => {
                return (
                  <Button
                    key={String(index)}
                    type="button"
                    onClick={async (e) => {
                      setLoading(true);
                      try {
                        await action.onClick(e);
                      } catch (e: any) {
                        onError(e);
                      }
                      if (mounted.current) {
                        setLoading(false);
                      }
                    }}
                    loading={loading}
                    disabled={loading}
                    className={`h-12 mt-3 w-full lg:mx-1 ${
                      action.type === "danger" ? "bg-red-500" : ""
                    }`}
                  >
                    {action.content}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );

  return (
    <motion.div
      layout
      initial="from"
      animate="to"
      exit="from"
      //@ts-ignore
      variants={fadeInTop(0.35)}
      className="w-full flex flex-col"
    >
      {(!!title || !!titleKey) && (
        <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-6 xl:mb-8">
          {titleKey ? t(titleKey) : title}
        </h2>
      )}
      {form}
    </motion.div>
  );
}

export function setFormValue<T>(data: any, methods: UseFormReturn<T>) {
  const { setValue, getValues } = methods;
  Object.keys(getValues()).forEach((key) => {
    if (data?.hasOwnProperty(key)) {
      // @ts-ignore
      setValue(key, data[key]);
    }
  });
}
