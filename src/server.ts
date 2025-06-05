

import express from 'express';
import config from './config';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import  limiter  from '@/lib/express_rate_limit';
import v1Routes from '@/routes/v1';
import { connectoToDatabase, disconnectFromDatabase } from './lib/mongoose';


const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if(config.NODE_ENV === 'development' || !origin || config.WHITELIST_ORIGINS.includes(origin)) {
      callback(null, true); //Error: null, true: Se deja pasar la petición
    } else {
      callback(new Error(`CORS error: ${origin} is not allowed by CORS`), false); // Lo contrario
      console.log(`CORS error: ${origin} is not allowed by CORS`)
    }
  }
}

app.use(cors( corsOptions ));

// Se encarga de analizar (parsear) los cuerpos de las solicitudes entrantes que están codificadas 
// en formato application/x-www-form-urlencoded. Una vez analizados los datos estarán disponibles 
// en el objeto req.body del manejador de rutas.
app.use(express.urlencoded({ extended: true })); 

// Analiza la cabecera Cookie de la solicitud HTTP y popula req.cookies con un objeto que contiene 
// los nombres de las cookies como claves y sus valores.
app.use(cookieParser());

// Comprime los cuerpos de las respuestas HTTP antes de enviarlos al cliente
// La opción threshold: 1024 significa que solo se comprimirán las respuestas 
// cuyo tamaño sea superior a 1024 bytes (1KB).
app.use(
  compression({
    threshold: 1024,
  }),
);

// Añade cabeceras de seguridad a las respuestas HTTP
app.use(helmet());

app.use(limiter);

(async () => {
  try {

    await connectoToDatabase();

    app.use('/api/v1', v1Routes);
    app.listen(config.PORT, () => {
      console.log(`Server running. http://localhost:${config.PORT}`);
    })

  } catch (error) {
    console.log('Failed to start server', error);
    if(config.NODE_ENV === 'development') {
      process.exit(1);
    }
  }

})();


const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    console.log('Srever SHUTDOWN');
    process.exit(0);
  } catch (error) {
    console.log('Error during server shutdown', error);
  }
}

process.on('SIGTERM', handleServerShutdown); // Cuando se solicita la terminación de un proceso por parte del sistema operativo 
process.on('SIGINT', handleServerShutdown);  // Cuando se presiona CTrl + C se ejecuta un cierre controlado

