import path from "path";
import fs from "fs";

/** load env variables first **/
const isDev = process.env.NODE_ENV !== "production";
const envFile = path.resolve(process.cwd(), isDev ? ".env" : ".env.production");

if (fs.existsSync(envFile)) {
  require("dotenv").config({ path: envFile });
} else {
  throw new Error(`Could not find: ${envFile}`);
}
