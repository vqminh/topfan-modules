import Input from "../../../ui/input";
import { useForm } from "react-hook-form";
import TextArea from "../../../ui/text-area";
import { useUI } from "../../../../src/contexts/ui.context";
import React from "react";
import { registerEmail, registerText } from "../../../ui/input-utils";
import Form from "../form";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../../../utils/firebase";
import { CONVERSATIONS } from "../../../../src/utils/constants";
import { Conversation } from "../../../../src/framework/basic-rest/conversation-types";
import { ONE_DAY, SENDER_ID_TOPFAN } from "../../../utils/id";

interface ContactFormValues {
  uid?: string;
  name?: string;
  email?: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC<{ children?: React.ReactNode }>= () => {
  const { uid, isAuthorized } = useUI();
  const context = useForm<ContactFormValues>({
    defaultValues: {
      uid,
    },
  });
  const {
    register,
    formState: { errors },
  } = context;

  function onSubmit(values: ContactFormValues) {
    const { subject, message, email } = values;
    const me = uid || (email as string);
    const time = Date.now();
    return addDoc(collection(firestore, CONVERSATIONS), {
      updatedAt: serverTimestamp(),
      subject,
      to: [me, SENDER_ID_TOPFAN],
      lastMessage: {
        html: message,
        sender: me,
        time,
      },
      [SENDER_ID_TOPFAN]: serverTimestamp(),
      [me]: Timestamp.fromMillis(time - 30 * ONE_DAY), // mark as read
      [`_${me}`]: serverTimestamp(),
    } as Conversation);
  }

  return (
    <Form
      onSubmit={onSubmit}
      className="w-full mx-auto flex flex-col justify-center "
      formContext={context}
    >
      <div className="flex flex-col space-y-5">
        <div className="flex flex-col md:flex-row space-y-5 md:space-y-0">
          {!isAuthorized && (
            <Input
              {...registerText("name", register, errors, { required: true })}
              className="w-full md:w-1/2 "
              variant="solid"
            />
          )}
          {!isAuthorized && (
            <Input
              {...registerEmail("email", register, errors, {
                required: true,
              })}
              className="w-full md:w-1/2 md:ms-2.5 lg:ms-5 mt-2 md:mt-0"
              variant="solid"
            />
          )}
        </div>
        <Input
          {...registerText("subject", register, errors, {
            required: "forms:subject-required",
          })}
          className="relative"
          variant="solid"
        />
        <TextArea
          {...registerText("message", register, errors)}
          className="relative mb-4"
        />
      </div>
    </Form>
  );
};

export default ContactForm;
