
import config from "@/config";
import { logger } from "@/lib/winston";
import Blog from "@/models/blog";
import User from "@/models/user";
import type { Request, Response } from "express";


interface QueryType {
  status?: 'draft' | 'published';
}


const getBlogsByUser = async (req: Request, res: Response): Promise<void> => {

  try {

    const userId = req.params.userId;
    const currentUserId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset = parseInt(req.query.offset as string) || config.defaultResOffset;
    const query: QueryType = {}; // creamos un objeto QueryType vacío

    const currentUser = await User                                         // obtenemos el usuario autenticado
      .findById(currentUserId)
      .select('role')
      .lean()
      .exec();

    if (currentUser?.role === 'user') {                                    // si el usuario autenticadotiene el rol user
      query.status = 'published';                                          // solo devolvemos los blogs publicados
    }

    const total = await Blog.countDocuments({ author: userId, ...query }); // obtenemos el total de blogs publicados por el usuario de los params

    const blogs = await Blog.find({ author: userId, ...query })            // Buscamos los blogs en su tabla pertenecientes al usuario de los params con el status publicado si es role "user"
      .select('-banner.publicId -__v')                                     // Excluimos el campo __v del objeto y el banner.publicId
      .populate('author', '-createdAt -updatedAt -__v')                    // populamos el campo author con su campo createdAt, updatedAt y __v
      .limit(limit)                                                        // Limitamos el numero de resultados
      .skip(offset)                                                        // Omitimos los resultados iniciales
      .sort({ createdAt: -1 })                                             // Ordenamos por fecha de creación
      .lean()                                                              // Solo devolvemos el objeto sin el _id
      .exec();

    logger.info('All users retrieved', {
      limit,
      offset,
      total,
      blogs,
    });

    res.status(200).json({
      limit,
      offset,
      total,
      blogs,
    });




  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error while fetching blogs by user', error)
  }
}

export default getBlogsByUser