/**
 * https://nextjs.org/docs/api-reference/next/image#loader
 * https://github.com/firebase/functions-samples/blob/main/image-sharp/functions/index.js
 *
 */
import { ImageLoader } from "next/image";
import { initializeApp } from "firebase/app";
import {
  ActionCodeSettings,
  getAuth,
  sendSignInLinkToEmail,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeFirestore, Timestamp } from "firebase/firestore";
import { PROJECT_ID } from "@settings/site-settings";
import { getBucketURL } from "./id";
import { createActionLink } from "./auth";
export const BUCKET = `https://${PROJECT_ID}.appspot.com.storage.googleapis.com/`;
export const LOCAL_STORAGE_KEY_EMAIL = "emailForSignIn";

export const firebaseApp = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
  storageBucket: `${PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSENGER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});

export const auth = getAuth(firebaseApp);
auth.languageCode = "vi";
export const storage = getStorage(firebaseApp);

export const firestore = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
});

export const assetLoader: ImageLoader = ({ src }) => {
  return src;
};

export const vercelLoader: ImageLoader = ({ src, width, quality }) => {
  const url = encodeURIComponent(src);
  return `https://topfan.vercel.app/_next/image?url=${url}&w=${width}&q=${
    quality || 75
  }`;
};

export const storageLoader: ImageLoader = ({ src }) => {
  return getBucketURL(src);
};

export async function emailSignInLink(email: string) {
  const actionCodeSettings: ActionCodeSettings = createActionLink(
    window.location.origin
  );
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem(LOCAL_STORAGE_KEY_EMAIL, email);
}

export function formatDate(date: Timestamp) {
  return date?.toDate?.()?.toLocaleDateString() || "";
}

export function formatDateTime(date: Timestamp) {
  return (
    (date?.toDate?.()?.toLocaleDateString() || "") +
      " " +
      date?.toDate?.()?.toLocaleTimeString() || ""
  );
}
