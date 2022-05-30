import Cors from "cors";
import { getFirestore } from "firebase-admin/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import * as functions from "firebase-functions";
import { generateId, timeStamp } from "../utils/id";
import https, { RequestOptions } from "https";
import http from "http";
import stream from "stream";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { DecodedIdToken, getAuth } from "firebase-admin/auth";
import {DEV, PROJECT_ID} from "@topfan-modules/utils/env";

// Setting the `keepAlive` option to `true` keeps
// connections open between function invocations
const agent = new https.Agent({ keepAlive: true });

export function initFirebase() {
  if (!getApps().length) {
    const serviceAccount = require(`./${PROJECT_ID}-firebase-adminsdk.json`);
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      // on vercel override with prod project id
      serviceAccount.private_key = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n${serviceAccount.private_key}`;
    }
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${PROJECT_ID}.appspot.com`,
    });
    getFirestore().settings({
      ignoreUndefinedProperties: true,
    });
  }
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
export default function cors(req: NextApiRequest, res: NextApiResponse) {
  initFirebase();
  return new Promise((resolve, reject) => {
    Cors({
      // Only allow requests with GET, POST and OPTIONS
      methods: ["GET", "POST", "OPTIONS"],
    })(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export function verifyAdmin(auth: DecodedIdToken) {
  if (auth.admin === true) {
    return auth.uid;
  } else {
    throw new Error("Unauthorized: " + auth.uid);
  }
}

export async function checkUser(req: NextApiRequest) {
  const token = req.headers["token"] as string;
  let decoded = await verifyToken(token);
  req.body.uid = decoded.uid;
}

export function checkAdmin(req: NextApiRequest) {
  const token = req.headers["token"] as string;
  return checkAdminToken(token);
}

function verifyToken(token?: string) {
  if (!token) {
    throw new Error("Unauthorized");
  }
  return getAuth().verifyIdToken(token);
}

export function checkAdminToken(token?: string) {
  let decodedToken = verifyToken(token);
  return decodedToken.then(verifyAdmin);
}

export function logError(...args: any[]) {
  if (functions?.logger) {
    functions.logger.error(args);
  } else {
    console.error(args);
  }
}

export function info(...msg: any[]) {
  functions.logger ? functions.logger.info(msg) : console.log(msg);
}

export function debug(o: any) {
  if (DEV) {
    info(o);
  }
}

export const ERROR_CODES: any = {
  "auth/invalid-phone-number": "phoneNumber",
};

export function handleError(
  req: NextApiRequest,
  res: NextApiResponse,
  error: any
) {
  const { code, message } = error;
  logError(req.query, error);
  res.json({
    error: { code: ERROR_CODES[code] || code, message },
  });
}

export function sendGetRequest(
  host: string,
  path: string,
  operation?: string,
  headers?: any
) {
  return sendRequest(
    createRequestOptions(host, path, "GET", headers),
    null,
    operation
  );
}

export function sendRequest(
  requestOptions: RequestOptions,
  object: any | null,
  operation?: string
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const request = https.request(
      requestOptions,
      (response: http.IncomingMessage) => {
        let data = "";
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e: any) {
            logError(e, data);
          }
        });
      }
    );
    request.on("error", (err: Error) => {
      const details: any = {};
      details.error = err.toString() + "\n" + err.stack;
      details.date = timeStamp();
      delete requestOptions.agent;
      details.requestOptions = requestOptions;
      details.data = object;
      details.operation = operation;
      return getFirestore()
        .collection("errors")
        .doc(generateId() + "-" + operation)
        .set(details)
        .then(reject);
    });
    if (object) {
      request.write(JSON.stringify(object));
    }
    request.end();
  });
}

export function sendPostRequest(
  host: string,
  path: string,
  headers: any,
  data: any,
  operation?: string
) {
  return sendRequest(
    createRequestOptions(host, path, "POST", headers),
    data,
    operation
  );
}

export function createRequestOptions(
  host: string,
  path: string,
  method: string,
  headers?: any
) {
  return {
    rejectUnauthorized: false,
    hostname: host,
    path,
    method,
    headers,
    agent, // Holds the connection open after the first invocation
  } as RequestOptions;
}

export function download(url: string) {
  return new Promise<{ data: any; contentType: string }>((resolve, reject) =>
    https
      .request(url, (response) => {
        const data = new stream.Transform();
        const contentType = response.headers["content-type"] as string;
        response.on("data", (chunk) => data.push(chunk));
        response.on("end", () =>
          resolve({
            data: data.read(),
            contentType,
          })
        );
      })
      .on("error", reject)
      .end()
  );
}

export function fetch(url: string) {
  return new Promise<string>((resolve, reject) =>
    https
      .get(url, (resp: http.IncomingMessage) => {
        let data = "";
        resp.on("data", (chunk) => (data += chunk));
        resp.on("end", () => resolve(data));
      })
      .on("error", reject)
  );
}
