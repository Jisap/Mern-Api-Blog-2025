


import jwt from 'jsonwebtoken';
import config from '@/config';
import { Types } from 'mongoose';

export const generateAccessToken = (userId: Types.ObjectId): string => {
  return jwt.sign(
    { userId },
    config.JWT_ACCESS_SECRET,
    { 
      expiresIn: config.ACCESS_TOKEN_EXPIRY, 
      subject: 'accessApi',
    },
  )
}
export const generateRefreshToken = (userId: Types.ObjectId): string => {
  return jwt.sign(
    { userId },
    config.JWT_REFRESH_SECRET,
    { 
      expiresIn: config.REFRESH_TOKEN_EXPIRY, 
      subject: 'refreshToken',
    },
  )
}

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET)    // Se compara el token con el secreto de acceso y devuelve  el payload codificado (userId)
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET)   // Se compara el token con el secreto de refresco
}