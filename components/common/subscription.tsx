import Text from "../../ui/text";
import Input from "../../ui/input";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import React from "react";
import { SUBSCRIPTIONS } from "../../../src/utils/constants";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { firestore } from "../../utils/firebase";
import Form from "./form";
import { registerEmail } from "../../ui/input-utils";

interface Props {
  className?: string;
}

type FormValues = {
  email: string;
};

const Subscription: React.FC<Props> = ({
  className = "px-5 sm:px-8 md:px-16 2xl:px-24",
}) => {
  const context = useForm<FormValues>({
    defaultValues: {
      email: "",
    },
  });
  const {
    register,
    formState: { errors },
  } = context;
  const { t } = useTranslation();

  const onSubmit = ({ email }: FormValues) =>
    setDoc(doc(firestore, SUBSCRIPTIONS, email), {
      createdAt: serverTimestamp(),
    });

  return (
    <div
      className={`${className} flex flex-col xl:flex-row justify-center xl:justify-between items-center rounded-lg bg-gray-200 py-10 md:py-14 lg:py-16 dark:bg-secondary`}
    >
      <div className="-mt-1.5 lg:-mt-2 xl:-mt-0.5 text-center xl:text-start mb-7 md:mb-8 lg:mb-9 xl:mb-0">
        <Text
          variant="mediumHeading"
          className="mb-2 md:mb-2.5 lg:mb-3 xl:mb-3.5"
        >
          {t("common:text-subscribe-heading")}
        </Text>
        <p className="dark:text-secondary text-body text-xs md:text-sm leading-6 md:leading-7">
          {t("common:text-subscribe-description")}
        </p>
      </div>
      <Form
        formContext={context}
        onSubmit={onSubmit}
        buttonTitle={t("common:button-subscribe")}
        successMessageKey="common:subscribe-success"
        className="flex-shrink-0 w-full sm:w-96 md:w-[545px]"
      >
        <div className="flex flex-col sm:flex-row items-start justify-end">
          <Input
            placeholderKey="forms:placeholder-email-subscribe"
            variant="solid"
            className="w-full"
            inputClassName="px-4 lg:px-7 h-12 lg:h-14 text-center sm:text-start bg-primary"
            {...registerEmail("email", register, errors, {
              required: true,
            })}
            errorKey={errors.email?.message}
          />
        </div>
      </Form>
    </div>
  );
};

export default Subscription;
