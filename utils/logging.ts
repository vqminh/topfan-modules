import { auth } from "./firebase";
import axios from "axios";
import {API_URL, DEV, IS_SERVER} from "@topfan-modules/utils/env";

export function LOGGER(...args: any[]) {
  if (DEV) {
    args?.forEach(console.log);
  }
}

export function reportError(...data: any[]) {
  if (!DEV && !IS_SERVER) {
    axios
      .create({
        baseURL: API_URL,
        timeout: 1000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .post("/error", {
        data,
        location: window.location.href,
        uid: auth.currentUser?.uid,
        displayName: auth.currentUser?.displayName,
        email: auth.currentUser?.email,
      })
      .catch(console.error);
  } else {
    data?.forEach(console.error);
  }
}

export class ValidationError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}
