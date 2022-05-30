import Input from "../../ui/input";
import TextArea from "../../ui/text-area";
import { useUI } from "../../../src/contexts/ui.context";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import LoginSocial from "./login-social";
import {
  registerEmail,
  registerPhone,
  registerText,
} from "../../ui/input-utils";
import { Banner } from "../../ui/banner";
import Form, { setFormValue } from "../common/form";
import { SignUpIdolInputType } from "../../../src/framework/basic-rest/booking-types";
import { signUpIdol } from "../../../src/framework/basic-rest/auth/use-signup-idol";
import { auth } from "../../utils/firebase";
import { IdolPicture } from "../../../src/components/checkout/idol-picture";
import { User } from "@firebase/auth";
import { useCookie } from "react-use";
import CategoryBanner from "../containers/category-banner";
import Container from "../../ui/container";

const SignUpIdolForm: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { t } = useTranslation();
  const [cookies, , removeCookies] = useCookie("referral_code");
  const referralName = useCookie("referral_name");
  const referralCode = cookies;

  const methods = useForm<SignUpIdolInputType>();
  const {
    register,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = methods;

  const { closeModal, isAuthorized } = useUI();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const user = auth.currentUser;
    if (!!user) {
      const { displayName, email, phoneNumber } = user;
      setFormValue({ displayName, email, phoneNumber }, methods);
      setUser(user);
    }
  }, [isAuthorized]);

  const form = (
    <Form
      formContext={methods}
      onSubmit={async (data) => {
        await signUpIdol(data);
        removeCookies();
        referralName[2]();
      }}
      className="flex flex-col justify-center"
    >
      <div className="flex flex-col space-y-4">
        <Input
          variant="solid"
          {...registerText("displayName", register, errors, {
            required: true,
          })}
        />
        <Input
          variant="solid"
          {...registerEmail("email", register, errors, {
            required: true,
          })}
        />
        <Input
          variant="solid"
          {...registerPhone("phoneNumber", register, errors, {
            required: true,
          })}
        />
        <TextArea
          variant="solid"
          {...registerText("social_handle", register, errors)}
          placeholder={t("forms:placeholder-social-handler")}
        />
        <TextArea
          variant="solid"
          {...registerText("introduction", register, errors)}
        />
        {!!referralCode && (
          <>
            <input
              type="hidden"
              {...register("referral_name")}
              value={referralName[0] as string}
            />
            <input
              type="hidden"
              {...register("referral_code")}
              value={referralCode}
            />
          </>
        )}
      </div>
    </Form>
  );

  return (
    <Container>
      <CategoryBanner
        backgroundImage={"/assets/images/banner-idol-signup.jpeg"}
        mobileBackgroundImage={"/assets/images/banner-idol-signup-mobile.jpeg"}
        title={"Chia Sẻ Niềm Vui Với Fan Hâm Mộ Nhất Quả Đất"}
      />
      <div
        className={`py-5 px-5 sm:px-8 bg-primary dark:bg-secondary mx-auto rounded-lg w-full sm:w-96 md:w-450px border border-bgSecondary mt-8 lg:mt-10 ${className}`}
      >
        <div className="text-center mb-6 pt-2.5">
          <h1 className="text-heading text-lg md:text-xl lg:text-2xl mt-2 mb-2 sm:mb-3">
            {t("common:signup-idol-title")}
          </h1>
          {!!user?.photoURL && (
            <IdolPicture image={user.photoURL} name={user.displayName || ""} />
          )}
          <p className="text-sm md:text-base text-body mt-2 mb-8 sm:mb-10">
            {t("common:signup-idol-helper")}
          </p>
          {!!referralName[0] && (
            <p className="md:text-xl lg:text-2xl mt-2">
              {referralName[0] ? referralName[0] : ""} là người giới thiệu của
              bạn
            </p>
          )}
        </div>

        {!isSubmitSuccessful && !isAuthorized && (
          <LoginSocial isLoading={isSubmitting} onSuccess={closeModal} />
        )}
        {isSubmitSuccessful ? (
          <Banner messageKey="common:signup-idol-success" />
        ) : (
          form
        )}
      </div>
    </Container>
  );
};

export default SignUpIdolForm;
