

import { logger } from '@/lib/winston';
import config from '@/config';
import type { Request, Response } from 'express';
import User from '@/models/user';
import type { IUser } from '@/models/user';
import { genUsername } from '@/utils';


type UserData = Pick<IUser, 'username' | 'email' | 'password' | 'role'>; // Subtipo apartir de IUser

const register = async (req: Request, res: Response):Promise<void> => {

  const { email, password, role} = req.body as UserData;
  

  try {
    const username = genUsername();

    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    })

    res.status(200).json({
      message: 'New user created'
    })
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