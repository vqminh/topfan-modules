import { VTC_RETURN_URL } from "../../src/utils/constants";
import api from "../../src/framework/basic-rest/utils/api";
import {SITE_URL} from "./env";

export async function vtcPay(
  price: number,
  ref: string,
  payment_type: string = "DomesticBank"
) {
  const url = `${SITE_URL}${VTC_RETURN_URL}`;
  const {
    data: { signature },
  } = await api.post<{ signature: string }>("/vtc/sign", {
    price,
    ref,
    payment_type,
  });
  const query = new URLSearchParams();
  query.set("website_id", process.env.NEXT_PUBLIC_VTC_WEBSITE_ID as string);
  query.set("amount", String(price));
  query.set("receiver_account", process.env.NEXT_PUBLIC_VTC_ACCOUNT as string);
  query.set("reference_number", ref);
  query.set("currency", "VND");
  query.set("signature", signature);
  query.set("payment_type", payment_type);
  query.set("transaction_type", "sale");
  query.set("url_return", url);
  window.location.replace(
    `${process.env.NEXT_PUBLIC_VTC_CHECKOUT}?${query.toString()}`
  );
}
