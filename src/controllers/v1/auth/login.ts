


import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";
import User from "@/models/user";
import Token from "@/models/token";
import config from "@/config";
import type { Request, Response } from 'express';
import type { IUser } from '../../../models/user';

type UserData = Pick<IUser, 'email' | 'password'>; // Subtipo apartir de IUser

const login = async (req: Request, res: Response): Promise<void> => {

  try {

    const { email, password } = req.body as UserData;

    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec()

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.create({ // Se guarda el refreshToken en la BD para su gestión futura
      token: refreshToken,
      userId: user._id,
    })

    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken
    })

    res.cookie('refreshToken', refreshToken, { // El refreshToken se envía al cliente en una cookie HttpOnly
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken // El accessToken se envía en el cuerpo de la respuesta para uso inmediato
    });

    logger.info('User login successfully', {
      username: user.username,
      email: user.email,
      role: user.role,
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

export default login;