

import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { logger } from "@/lib/winston";
import Token from "@/models/token";
import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { generateAccessToken, verifyRefreshToken } from "@/lib/jwt";

const refreshToken = async (req: Request, res: Response) => {
  
  const refreshToken = req.cookies.refreshToken as string;                             // Obtenemos el token de refresco del cliente de la cookie de autenticación

  try {
    const tokenExists = await Token.exists({ token: refreshToken });                   // Verificamos si el token existe en la BD

    if(!tokenExists) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    // Verify refresh token
    const jwtPayload = verifyRefreshToken(refreshToken) as { userId: Types.ObjectId }; // Comparamos el token de refresco con el secreto de refresco -> obtenemos el payload (userId)

    const accessToken = generateAccessToken(jwtPayload.userId);                        // Generamos el token de acceso con el payload (userId)

    res.status(200).json({
      accessToken,
    });


  } catch (error) {

    if(error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token expired, please login again',
      });
      return;
    }

    if(error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })

    logger.error('Error during refresh token', error)
  }
}

export default refreshToken;