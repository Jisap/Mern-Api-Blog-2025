import { logger } from "@/lib/winston";
import User from "@/models/user";
import type { Request, Response } from "express";




const deleteCurrentUser = async (req: Request, res: Response): Promise<void> => {

  const userId = req.userId; // Obtenemos el userId del usuario desde la cabecera de la petición (cookies)
 
  try {                  

    await User.deleteOne({ _id: userId }); // Borramos el usuario de la BD
    logger.info('A user account has been deleted', {
      userId
    });
    res.status(204).json({
      message: 'User deleted'
    });


  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error while deleting current user', error)
  }
}

export default deleteCurrentUser