

import uploadToCloudinary from '@/lib/cloudinary';
import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import type { Request, Response, NextFunction } from 'express';
import type { UploadApiErrorResponse } from 'cloudinary';


const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const uploadBlogBanner = (method: 'post' | 'put') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    
    if(method === 'put' && !req.file) {                // Si el método es PUT y no hay archivo en la petición, pasa al siguiente middleware
      next();
      return;
    }

    if(!req.file){
      res.status(400).json({
        code: 'BadRequest',
        message: 'Blog banner is required',
      })
      return;
    }

    if(req.file.size > MAX_FILE_SIZE) {                    // Si el tamaño del archivo es mayor a 2 MB, devuelve un error 413
      res.status(413).json({
        code: 'ValidationError',
        message: "File size must be less than 2MB",
      })
      return
    }

    try {
      const { blogId } = req.params;                       // Obtiene el blogId del objeto req.params
      const blog = await Blog.findById(blogId)             // Obtiene el objeto blog de la base de datos correspondiente al blogId
        .select('banner.publicId')
        .exec()

      const data = await uploadToCloudinary(               // Sube el banner_image a Cloudinary
        req.file.buffer,
        blog?.banner.publicId.replace('blog-api/', '')     // Reemplaza el nombre de archivo original del banner_image por el nuevo nombre del banner_image en Cloudinary
      )

      if(!data){                                           // Si el método de subida a Cloudinary falla, devuelve un error 500
        res.status(500).json({
          code: 'ServerError',
          message: 'Internal server error',
        })
        logger.error('Error while uploading blog banner to cloudinary', {
          blogId,
          publicId: blog?.banner.publicId,
        })
        return
      }

      const newBanner = {                                  // Si la subida a Cloudinary es exitosa, crea un nuevo objeto banner en la base de datos
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      }

      logger.info('Blog banner uploaded to Cloudinary', {
        blogId,
        banner: newBanner
      })

      req.body.banner = newBanner;                         // Actualiza el objeto req.body con el nuevo banner para que el contoller createBlog/updateBlog lo utilice

      next();

    } catch (error: UploadApiErrorResponse | any) {
      res.status(error.http_code).json({
        code: error.http_code < 500 ? 'ValidationError' : error.name,
      });

      logger.error('Error while uploading blog banner to cloudinary', error) // Registra el error en el logger
    }
  }
}

export default uploadBlogBanner