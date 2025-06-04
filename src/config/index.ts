import dotenv from "dotenv";
import { prototype } from "events";

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
}

export default config;