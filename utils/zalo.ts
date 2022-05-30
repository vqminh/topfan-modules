import { logError, sendPostRequest } from "../server/request";

export function sendZaloMessage(user_id: any, message: any) {
  const access_token = process.env.NEXT_PUBLIC_ZALO_APP_ID;
  if (!access_token) {
    logError(message, new Error("Missing zalo.access_token"));
  }
  return sendPostRequest(
    "openapi.zalo.me",
    `/v2.0/oa/message?access_token=${access_token}`,
    { "Content-Type": "application/json" },
    {
      recipient: { user_id },
      message: {
        text: message,
      },
    },
    "zalo/send"
  );
}
