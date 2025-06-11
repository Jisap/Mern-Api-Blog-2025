import dotenv from "dotenv";
import type ms from 'ms';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  WHITELIST_ORIGINS: ["https://docs.blog-api.codewithsadee.com"],
  MONGO_URI: process.env.MONGO_URI,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY as ms.StringValue,
  WHITELIST_ADMINS_MAIL: [ // Lista de emails de los administradores que pueden registrarse
    'test1@test.com',
    'test2@test.com',
  ],
  defaultResLimit: 20,
  defaultResOffset: 0,
}

export default config;