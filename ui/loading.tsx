import { useTranslation } from "next-i18next";
import ErrorInformation from "../components/404/error-information";

export function Loading({
  messageKey,
  error,
}: {
  messageKey?: string;
  error?: string;
}) {
  const { t } = useTranslation();
  if (error) {
    return <ErrorInformation error={error} />;
  }
  return <p>{t(messageKey || "text-loading")}</p>;
}
