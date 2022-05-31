import Button from "../../ui/button";
import Input from "../../ui/input";
import { useUI } from "src/contexts/ui.context";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import LoginSocial from "./login-social";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { reportError } from "../../utils/logging";
import { emailSignInLink } from "../../utils/firebase";

interface LoginInputType {
  email: string;
}

const LoginForm: React.FC<{ children?: React.ReactNode }>= () => {
  const { t } = useTranslation();
  const { setModalView, openModal, closeModal } =
    useUI();
  const [success, setSuccess] = useState(false);
  const { mutate: login, isLoading } = useMutation(
    ({ email }) => emailSignInLink(email),
    {
      onSuccess: () => setSuccess(true),
      onError: reportError,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputType>();

  function onSubmit({ email }: LoginInputType) {
    login({
      email,
    });
  }

  function handleSignUp() {
    setModalView("SIGN_UP_VIEW");
    return openModal();
  }

  const content = success ? (
    <div className="text-center mb-6 pt-2.5">
      <h2 className="mt-2 mb-2 sm:mb-3">{t("common:login-check-email")}</h2>
    </div>
  ) : (
    <>
      <LoginSocial isLoading={isLoading} onSuccess={closeModal} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center"
        noValidate
      >
        <div className="flex flex-col space-y-3.5">
          <Input
            labelKey="forms:label-email"
            type="email"
            variant="solid"
            {...register("email", {
              required: `${t("forms:email-required")}`,
              pattern: {
                value:
                  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: t("forms:email-error"),
              },
            })}
            errorKey={errors.email?.message}
          />
          <div className="relative">
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="h-11 md:h-12 w-full mt-1.5"
            >
              {t("common:text-login")}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-sm sm:text-base text-body text-center mt-5 mb-1">
        {t("common:text-no-account")}{" "}
        <button
          type="button"
          className="text-sm sm:text-base text-heading underline font-bold hover:no-underline focus:outline-none"
          onClick={handleSignUp}
        >
          {t("common:text-register")}
        </button>
      </div>
    </>
  );

  return (
    <div className="overflow-hidden bg-primary dark:bg-secondary mx-auto rounded-lg w-full sm:w-96 md:w-450px border border-bgSecondary py-5 px-5 sm:px-8">
      <div className="text-center mb-6 pt-2.5">
        <h1 className="text-heading mt-2 mb-2 sm:mb-3">{t("common:login-helper")}</h1>
      </div>
      {content}
    </div>
  );
};

export default LoginForm;
