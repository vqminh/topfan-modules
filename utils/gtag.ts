import {IS_SERVER} from "./env";

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export const pageview = (url: URL) => {
  if (!IS_SERVER && gtag) {
    gtag?.("config", GA_TRACKING_ID as string, {
      page_path: url,
    });
  }
};

type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
};

export const sendEvent = ({ action, category, label, value }: GTagEvent) => {
  if (!IS_SERVER && gtag) {
    gtag?.("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
