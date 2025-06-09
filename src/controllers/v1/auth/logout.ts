import { logger } from "@/lib/winston";
import token from "@/models/token";
import config from "@/config";
import type { Request, Response } from 'express';
import refreshToken from '@/controllers/v1/auth/refresh_Token';
import Token from '@/models/token';



const logout = async (req: Request, res: Response): Promise<void> => {

  try {

    const refreshToken = req.cookies.refreshToken as string;
    if(refreshToken){
      await Token.deleteOne({ token: refreshToken }); // Eliminamos el refreshToken de la BD

      logger.info('user refresh token deleted succesfuly', {
        userId: req.userId,
        token: refreshToken
      })
    }

    res.clearCookie('refreshToken', { // Eliminamos la cookie del cliente
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    res.sendStatus(204);

    logger.info('user logged out succesfuly', {
      userId: req.userId,
    })

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })

    logger.error('Error during logout', error)
  }
}

export default logout;