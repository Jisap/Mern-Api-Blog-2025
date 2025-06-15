import { logger } from "@/lib/winston";
import User from "@/models/user";
import Blog from "@/models/blog";
import type { Request, Response } from "express";
import { v2 as cloudinary } from 'cloudinary';




const deleteCurrentUser = async (req: Request, res: Response): Promise<void> => {

  const userId = req.userId; // Obtenemos el userId del usuario desde la cabecera de la petición (cookies)
 
  try {   
    
    const blogs = await Blog.find({ author: userId })                 // Buscamos todos los blogs del usuario en la BD
      .select('banner.publicId')                                      // Seleccionamos los banners asociados                           
      .lean()
      .exec();

    const publicIds = blogs.map(({ banner }) => banner.publicId);     // Obtenemos los ids de los banners asociados
    await cloudinary.api.delete_resources(publicIds)                  // Borramos los banners de cloudinary

    logger.info('Multiple banners deleted from Cloudinary', { 
      userId
    });

    await Blog.deleteMany({ author: userId })                        // Borramos todos los blogs del usuario de la BD
    logger.info('All blogs deleted successfuly', { 
      userId,
      blogs
    });

    await User.deleteOne({ _id: userId });                            // Borramos el usuario de la BD
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