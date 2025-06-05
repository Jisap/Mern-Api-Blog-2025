

import express from 'express';
import config from './config';
import cors from 'cors';
import type { CorsOptions } from 'cors';

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

app.get('/', (req, res) => {
  res.json({
    message: "Hello World!"
  })
})

app.listen(config.PORT, () => {
  console.log(`Server running. http://localhost:${config.PORT}`);
})