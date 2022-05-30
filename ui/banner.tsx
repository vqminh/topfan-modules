import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";
import { useTranslation } from "next-i18next";
import { FormAction } from "../components/common/form";
import Button from "./button";

export function Banner({
  messageKey,
  message,
  type = "success",
  action,
  admin = false,
}: {
  messageKey?: string;
  message?: string;
  type?: "danger" | "success";
  action?: FormAction;
  admin?: boolean;
}) {
  const { t } = useTranslation();
  const bg =
    type === "success"
      ? "bg-green-500"
      : type === "danger"
      ? "bg-red-500"
      : "bg-heading";
  return (
    <div className="border border-gray-300 bg-secondary px-4 lg:px-5 py-4 rounded-md flex items-center justify-start text-heading text-sm md:text-base mb-6 lg:mb-8">
      <span
        className={`w-10 h-10 me-3 lg:me-4 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
      >
        {type === "success" && (
          <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
        )}
        {type === "danger" && (
          <IoAlertCircle className="w-5 h-5 text-red-600" />
        )}
      </span>
      {messageKey ? t(messageKey) : message}
      {!!action && !admin && (
        <Button onClick={action.onClick}>{action.content}</Button>
      )}
    </div>
  );
}
