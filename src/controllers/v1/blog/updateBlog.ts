import { logger } from '@/lib/winston';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';


import type { Request, Response } from 'express';
import Blog from '@/models/blog';
import User from '@/models/user';
import { IBlog } from '../../../models/blog';


type BlogData = Partial<Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>>;

const window = new JSDOM('').window; // DOMPurify necesita un objeto window para funcionar
const purify = DOMPurify(window);    // DOMPurify es una librería que limpia el contenido de HTML y XSS

const updateBlog = async (req: Request, res: Response): Promise<void> => {

  try {

    const { title, content, banner, status } = req.body as BlogData;            // Obtenemos los datos del objeto req.body
    const userId = req.userId;                                                  // Obtenemos el objeto req.userId del middleware authenticate
    const blogId = req.params.blogId;                                           // Obtenemos el objeto req.params.blogId de la url

    const user = await User.findById(userId).select('role').lean().exec();
    const blog = await Blog.findById(blogId).select('-__v').exec();

    if(!blog){
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      })
      return
    }

    if(blog.author !== userId && user?.role !== 'admin'){
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      });

      logger.warn('A user tried to update a blog without permission', {
        userId,
        blogId,
      });
      return
    }

    // Se asignan los valores de los campos de la petición a los campos del objeto blog

    if(title) blog.title = title;
    if(content) {
      const cleanContent = purify.sanitize(content); // Elimina cualquier código malicioso que pudiera tener la entrada
      blog.content = cleanContent;
    }
    if(banner) blog.banner = banner;
    if(status) blog.status = status;
  
    await blog.save();                               // Guardamos el objeto blog en la base de datos
    logger.info('Blog updated', { blog })

    res.status(200).json({
      blog,
    })

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error during updating blog', error)
  }
}

export default updateBlog 