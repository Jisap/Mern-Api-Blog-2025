import config from "@/config";
import { logger } from "@/lib/winston";
import User from "@/models/user";
import type { Request, Response } from "express";


const getUser = async (req: Request, res: Response): Promise<void> => {

  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .select('-__v') // Excluimos el campo __v del objeto
      .exec();

    if(!user) {
      res.status(404).json({
        code: 'UserNotFound',
        message: 'User not found',
      })
      return
    }

    res.status(200).json({
      user,
    });

    logger.info('User retrieved', {
      userId,
      user,
    });
    
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error while getting a user', error)
  }
}

export default getUser