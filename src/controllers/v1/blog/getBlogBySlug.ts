
import config from "@/config";
import { logger } from "@/lib/winston";
import Blog from "@/models/blog";
import User from "@/models/user";
import type { Request, Response } from "express";



const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {

  try {

    const userId = req.params.userId;
    const slug = req.params.slug;

    const user = await User                                                // obtenemos el usuario según params
      .findById(userId)
      .select('role')
      .lean()
      .exec();
      
    const blog = await Blog.findOne({ slug })                              // Buscamos un blog que coincida con el slug
      .select('-banner.publicId -__v')                                     // Excluimos el campo __v del objeto y el banner.publicId
      .populate('author', '-createdAt -updatedAt -__v')                    // populamos el campo author con su campo createdAt, updatedAt y __v
      .sort({ createdAt: -1 })                                             // Ordenamos por fecha de creación
      .lean()                                                              // Solo devolvemos el objeto sin el _id
      .exec();

    if(!blog){
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
        blog,
      })
      return
    }

    if (user?.role === 'user' && blog.status === 'draft') {                 // si el usuario de los params tiene el rol user y el blog es un blog de borrador y no se muestra
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      })

      logger.warn('A user tried to access a draft blog', {
        userId,
        slug,
      });

      return
    }

    res.status(200).json({
      blog
    });

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error while fetching blog by slug', error)
  }
}

export default getBlogBySlug