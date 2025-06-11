import config from "@/config";
import { logger } from "@/lib/winston";
import User from "@/models/user";
import type { Request, Response } from "express";


const getAllUser = async (req: Request, res: Response): Promise<void> => {

 

  try {

    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset = parseInt(req.query.offset as string) || config.defaultResOffset;
    const total = await User.countDocuments();

    const users = await User.find()
      .select('-__v') // Excluimos el campo __v del objeto
      .limit(limit)   // Limitamos el numero de resultados
      .skip(offset)   // Omitimos los resultados iniciales
      .lean()         // Solo devolvemos el objeto sin el _id
      .exec();

    logger.info('All users retrieved', {
      limit,
      offset,
      total,
      users,
    });

    res.status(200).json({
      limit,
      offset,
      total,
      users,
    });
    

  

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error while getting all users', error)
  }
}

export default getAllUser