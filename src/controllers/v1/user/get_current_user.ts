import { logger } from "@/lib/winston";
import User from "@/models/user";
import type { Request, Response } from "express";



const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const userId = req.userId;
    const user = await User
      .findById(userId) // Buscamos el usuario en la BD
      .select('-__v')   // Excluimos el campo __v del objeto
      .lean()           // Solo devolvemos el objeto sin el _id
      .exec();          // Ejecutamos la consulta en la BD

    res.status(200).json({
      user
    });

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error while getting current user', error)
  }
}

export default getCurrentUser;


