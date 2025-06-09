import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";
import  type { Request, Response, NextFunction  } from 'express';
import { Types } from "mongoose";
import token from '@/models/token';
import jwt from 'jsonwebtoken';


const authenticate = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization as string;                          // Obtenemos el header de autorización
  if(!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Authorization header is required',
    });
    return;
  }
    
  const [_, token] = authHeader.split(' ');                                         // Extraemos el token de acceso

  try {
    
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId }       // Verificamos el token de acceso y obtenemos el payload (userId)
    
    req.userId = jwtPayload.userId;                                                 // Se guarda el userId en la propiedad de la solicitud
    
    return next();                                                                  // Llamamos al siguiente middleware
  
  } catch (error) {
    if(error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token expired, request a new one with refresh token',
      });
      return;
    }

    if(error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid access token',
      });
      return;
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })

    logger.error('Error during authentication', error)
  }
}

export default authenticate;
