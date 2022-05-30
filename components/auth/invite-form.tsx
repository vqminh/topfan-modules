import Input from "../../ui/input";
import { useTranslation } from "next-i18next";
import React from "react";
import { useForm } from "react-hook-form";
import {
  registerEmail,
  registerPhone,
  registerText,
} from "../../ui/input-utils";
import { sendEvent } from "../../utils/gtag";
import { SignupType } from "../../../src/framework/basic-rest/booking-types";
import { firestore } from "../../utils/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { SIGNUPS } from "../../../src/utils/constants";
import Form from "../common/form";
import { apiPost } from "../../../src/framework/basic-rest/utils/api";
import { useUI } from "../../../src/contexts/ui.context";
import { IDOL_INVITE } from "../../../src/settings/templates";

const SignupForm: React.FC<{ children?: React.ReactNode }>= () => {
  const { t } = useTranslation();
  const { closeModal } = useUI();
  const context = useForm<SignupType>();
  const {
    register,
    formState: { errors },
  } = context;

  async function onSubmit({
    displayName,
    email,
    phoneNumber,
    intro,
  }: SignupType) {
    sendEvent({ action: "Invite", category: "Email", value: 1 });
    const ref = await addDoc(collection(firestore, SIGNUPS), {
      displayName,
      email,
      phoneNumber,
      intro,
      pre_approved: serverTimestamp(),
    } as SignupType);
    const { id } = ref;
    await apiPost("/admin/email", {
      id,
      displayName,
      email,
      template: IDOL_INVITE,
    });
    closeModal();
  }

  return (
    <div className="py-5 px-5 sm:px-8 bg-primary dark:bg-seconday mx-auto rounded-lg w-full sm:w-96 md:w-450px border border-bgSecondary">
      <Form
        onSubmit={onSubmit}
        className="flex flex-col justify-center"
        formContext={context}
        buttonTitle={t("common:text-invite")}
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
            {...registerText("intro", register, errors, {
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
            {...registerPhone("phoneNumber", register, errors)}
          />
        </div>
      </Form>
    </div>
  );
};

export default SignupForm;
