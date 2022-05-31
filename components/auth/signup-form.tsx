import Button from "../../ui/button";
import Input from "../../ui/input";
import Link from "../../ui/link";
import { useUI } from "src/contexts/ui.context";
import { useSignUpMutation } from "@topfan-modules/utils/use-signup";
import { ROUTES } from "@utils/routes";
import { useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";
import LoginSocial from "./login-social";
import { registerPhone } from "../../ui/input-utils";
import { Profile } from "src/types/account";
import { sendEvent } from "../../utils/gtag";
import { MODAL } from "../common/modal/managed-modal";

const SignupForm: React.FC<{ children?: React.ReactNode }>= () => {
  const { t } = useTranslation();
  const { mutate: signUp, isLoading, isError, error } = useSignUpMutation();
  const { setModalView, openModal, closeModal } = useUI();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Profile>();

  function handleSignIn() {
    setModalView(MODAL.LOGIN);
    return openModal();
  }

  function onSubmit({ displayName, email, phoneNumber }: Profile) {
    sendEvent({ action: "SignUp", category: "Email", value: 1 });
    signUp({
      email,
      phoneNumber,
      displayName,
    } as Profile);
  }

  return (
    <div className="py-5 px-5 sm:px-8 bg-primary dark:bg-secondary mx-auto rounded-lg w-full sm:w-96 md:w-450px border border-bgSecondary">
      <div className="text-center mb-6 pt-2.5">
        <p className="text-sm md:text-base text-body mt-2 mb-8 sm:mb-10">
          {t("common:registration-helper")}{" "}
          <Link
            href={ROUTES.TERMS}
            className="text-heading underline hover:no-underline focus:outline-none"
            target="_blank"
          >
            {t("common:text-terms")}
          </Link>{" "}
          &amp;{" "}
          <Link
            href={ROUTES.POLICY}
            className="text-heading underline hover:no-underline focus:outline-none"
            target="_blank"
          >
            {t("common:text-policy")}
          </Link>
        </p>
      </div>
      <LoginSocial isLoading={isLoading} onSuccess={closeModal} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center"
        noValidate
      >
        <div className="flex flex-col space-y-4">
          <Input
            labelKey="forms:label-name"
            type="text"
            variant="solid"
            {...register("displayName", {
              required: "forms:name-required",
            })}
            errorKey={errors.displayName?.message}
          />
          <Input
            labelKey="forms:label-email"
            type="email"
            variant="solid"
            {...register("email", {
              required: `${t("forms:email-required")}`,
              pattern: {
                value:
                  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: t("forms:error"),
              },
            })}
            errorKey={
              isError!! ? t(getErrorMessage(error)) : errors.email?.message
            }
          />
          <Input
            variant="solid"
            {...registerPhone("phoneNumber", register, errors)}
          />
          <div className="relative">
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="h-11 md:h-12 w-full mt-2"
            >
              {t("common:text-register")}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-sm sm:text-base text-body text-center mt-5 mb-1">
        {t("common:text-have-account")}{" "}
        <button
          type="button"
          className="text-sm sm:text-base text-heading underline font-bold hover:no-underline focus:outline-none"
          onClick={handleSignIn}
        >
          {t("common:text-login")}
        </button>
      </div>
    </div>
  );
};

function getErrorMessage(err: any) {
  const { code, message } = err;
  return code === "auth/email-already-in-use"
    ? "common:text-email-already-in-use"
    : message;
}

export default SignupForm;
