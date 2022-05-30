export const PLACE_HOLDER = "/assets/images/pwa.png";
export const RESPONSE_SIZE = {
  width: 1080,
  height: 1920,
};
export const IS_SERVER = typeof window === "undefined";
export const DEV = process.env.NODE_ENV !== "production";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
export const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
export const REGION = process.env.NEXT_PUBLIC_REGION as string;
export const API_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/api`;
export const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN as string;