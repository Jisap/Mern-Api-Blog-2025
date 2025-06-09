

import * as express from 'express';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId; // Añadimos la propiedad userId a la solicitud Express
    }
  }
}
