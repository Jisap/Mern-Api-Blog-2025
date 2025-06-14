import config from "@/config";
import { logger } from "@/lib/winston";
import Blog from "@/models/blog";
import User from "@/models/user";
import type { Request, Response } from "express";


interface QueryType {
  status?: 'draft' | 'published';
}


const getAllBlogs = async (req: Request, res: Response): Promise<void> => {

  try {

    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset = parseInt(req.query.offset as string) || config.defaultResOffset;
    const total = await Blog.countDocuments();
    const query: QueryType = {}; // creamos un objeto QueryType vacío

    const user = await User      // obtenemos el usuario
      .findById(userId)
      .select('role')
      .lean()
      .exec();

    if(user?.role === 'user'){
      query.status = 'published';
    }


    const blogs = await Blog.find(query)                  // Buscamos los blogs en su tabla
      .select('-banner.publicId -__v')                    // Excluimos el campo __v del objeto y el banner.publicId
      .populate('author', '-createdAt -updatedAt -__v')   // populamos el campo author con su campo createdAt, updatedAt y __v
      .limit(limit)                                       // Limitamos el numero de resultados
      .skip(offset)                                       // Omitimos los resultados iniciales
      .sort({ createdAt: -1 })                            // Ordenamos por fecha de creación
      .lean()                                             // Solo devolvemos el objeto sin el _id
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
    logger.error('Error while fetching blogs', error)
  }
}

export default getAllBlogs