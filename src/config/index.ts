import dotenv from "dotenv";
import { prototype } from "events";

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  WHITELIST_ORIGINS: ["https://docs.blog-api.codewithsadee.com"]
}

export default config;