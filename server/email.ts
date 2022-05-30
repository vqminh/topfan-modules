/**
 * @see https://app.sendgrid.com/guide/integrate/langs/nodejs
 */
import sgMail from "@sendgrid/mail";
import { MailDataRequired } from "@sendgrid/mail/src/mail";
import { Liquid } from "liquidjs";
import path from "path";
import { DEV, SITE_URL } from "../../src/settings/site-settings";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { CONVERSATIONS } from "../../src/utils/constants";
import { Conversation, Message } from "../../src/framework/basic-rest/conversation-types";
import { SENDER_ID_TOPFAN } from "../utils/id";
import { info } from "./request-utils";
import nodemailer from "nodemailer";

export const EMAIL_SUPPORT = process.env.SENDGRID_SENDER_SUPPORT as string;
export const EMAIL_ADMIN = process.env.SENDGRID_SENDER_ADMIN as string;
export const TEMPLATES = "templates";
const TEMPLATES_ROOT = path.resolve(
  process.cwd(),
  DEV ? "templates" : ".next/server/chunks/templates"
);

/**
 * To view staging email go to: https://ethereal.email/messages
 * @param message
 */
export async function sendEmail(message: MailDataRequired) {
  message.to = message.to || EMAIL_ADMIN;
  message.from = message.from || EMAIL_SUPPORT;
  if (DEV) {
    info(message);
  } else {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      return await sgMail.send(message);
    } else {
      // staging
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "jermaine.muller55@ethereal.email",
          pass: "eEUp77RKzGGKjTjyTR",
        },
      });
      const { from, to, subject, text, html } = message;
      const result = await transporter.sendMail({
        from: (from as any)?.email || (from as string),
        to: (to as any)?.email || (to as string),
        subject,
        text,
        html,
      });
      info("Preview URL: %s", nodemailer.getTestMessageUrl(result));
    }
  }
}

export const moneyFilter = (v: string | number) =>
  Number(v).toLocaleString() + "₫";

export async function renderLiquid(data: any, template: any) {
  const liquid = new Liquid({
    root: TEMPLATES_ROOT,
  });
  liquid.registerFilter("money", moneyFilter);
  if (typeof template === "string") {
    return await liquid.parseAndRender(template, data);
  }
  if (typeof template === "object") {
    const result: any = {};
    for (const key of Object.keys(template).filter((key) =>
      template.hasOwnProperty(key)
    )) {
      const value = template[key];
      if (value) {
        result[key] = await renderLiquid(data, value);
      }
    }
    return result;
  }
  return null;
}

export async function emailWithTemplate(name: string, data: any) {
  const liquid = new Liquid({
    root: TEMPLATES_ROOT,
  });
  const params = {
    ...data,
    domain: SITE_URL,
    SENDGRID_SENDER_IDOL: process.env.SENDGRID_SENDER_IDOL,
    SENDGRID_SENDER_SUPPORT: process.env.SENDGRID_SENDER_SUPPORT,
  };
  liquid.registerFilter("money", moneyFilter);
  const email = await liquid.renderFile(`${name}.json`, params);
  const html = await liquid.renderFile(`${name}.body.html`, params);

  const result = JSON.parse(email);
  const { uid, path, ...rest } = result;
  if (uid) {
    await createConversation({ ...result, html, template: name, refId: data.id });
  }
  await sendEmail({
    ...rest,
    html,
  }).catch((e) => {
    throw new Error(
      `Error sending template "${name}" with: ${JSON.stringify(result)}: ${
        e.message
      }: ${e.stack}`
    );
  });
  return result;
}

export function createConversation({
  uid,
  subject,
  html,
  template,
  refId,
}: {
  uid: string;
  subject: string;
  html: string;
  template: string;
  refId: string;
}) {
  return getFirestore()
    .collection(CONVERSATIONS)
    .doc()
    .set({
      uid,
      template,
      refId,
      [uid]: FieldValue.serverTimestamp(),
      [SENDER_ID_TOPFAN]: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      subject,
      to: [uid, SENDER_ID_TOPFAN],
      lastMessage: {
        html,
        sender: SENDER_ID_TOPFAN,
        time: Date.now(),
      } as Message,
    } as Conversation);
}
