

import mongoose, { Connection } from "mongoose";
import config from "@/config";
import type { ConnectOptions } from "mongoose";
import { logger } from "./winston";


const clientOptions: ConnectOptions = {
  dbName: "blog-db",
  appName: "Blog-API",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  }
}

export const connectoToDatabase = async ():Promise<void> => {
  if(!config.MONGO_URI) {
    throw new Error('No se ha configurado la URI de MongoDB');
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);
    logger.info('Conectado a MongoDB con éxito', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if(error instanceof mongoose.Error) {
      throw error;
    }
    logger.error("Error al conectar a MongoDB", error);
  }
}

export const disconnectFromDatabase = async ():Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Desconectado de MongoDB con éxito',{
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if(error instanceof Error) {
      throw new Error(error.message);
    }
    logger.error("Error al desconectar de MongoDB", error);
  }
}