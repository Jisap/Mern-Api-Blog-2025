

import { logger } from '@/lib/winston';
import config from '@/config';
import type { Request, Response } from 'express';
import User from '@/models/user';
import type { IUser } from '@/models/user';
import { genUsername } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import Token from '@/models/token';


type UserData = Pick<IUser, 'username' | 'email' | 'password' | 'role'>; // Subtipo apartir de IUser

const register = async (req: Request, res: Response):Promise<void> => {

  const { email, password, role} = req.body as UserData;
  
  if(role === 'admin' && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
    res.status(403).json({
      code: 'AuthorizationError',
      message: 'You cannot register as an admin',
    });
    
    logger.warn(
      `User with email ${email} tried to register as an admin but is no in the whitelist`,
    )
    return;
  }


  try {
    const username = genUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    const accessToken = generateAccessToken(newUser._id);    // Vida corta, se usa para autorizar rutas protegidas
    const refreshToken = generateRefreshToken(newUser._id);  // Vida larga, se usa para refrescar el token de acceso

    await Token.create({                                     // Se guarda el refreshToken en la BD para su gestión futura
      token: refreshToken,
      userId: newUser._id,
    })

    logger.info('Refresh token created for user', {
      userId: newUser._id,
      token: refreshToken
    })

    res.cookie('refreshToken', refreshToken, {               // El refreshToken se envía al cliente en una cookie HttpOnly
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken                                           // El accessToken se envía en el cuerpo de la respuesta para uso inmediato
    });

    logger.info('User registered successfully', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })

    logger.error('Error during user registration', error)
  }
}

export default register;