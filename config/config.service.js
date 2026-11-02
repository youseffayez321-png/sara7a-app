import { config } from "dotenv";
import { resolve } from "node:path";
const NODE_ENV = process.env.NODE_ENV;
const envPaths = {
    development: ".env.development",
    production: ".env.production",
};

config({ path: resolve(`config/${envPaths[NODE_ENV]}`) });

export const PORT = +process.env.PORT;
export const DB_URL = process.env.DB_URL;
export const REDIS__URL = process.env.REDIS__URL;
export const ENCRYPTION_KEYS = process.env.ENCRYPTION_KEYS;
export const ACCESS_TOKEN_SIGNATURE = process.env.ACCESS_TOKEN_SIGNATURE;
export const REFRESH_TOKEN_SIGNATURE = process.env.REFRESH_TOKEN_SIGNATURE;
export const EMAIL = process.env.EMAIL;
export const PASSWORD = process.env.PASSWORD;
export const SALT_ROUNDS = +process.env.SALT_ROUNDS;
export const AUDIENCE = process.env.AUDIENCE;
