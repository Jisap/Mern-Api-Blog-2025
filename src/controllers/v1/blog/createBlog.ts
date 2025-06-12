

import { logger } from '@/lib/winston';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';


import type { Request, Response } from 'express';
import Blog from '@/models/blog';
import { IBlog } from '../../../models/blog';

type BlogData = Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>;

const window = new JSDOM('').window; // DOMPurify necesita un objeto window para funcionar
const purify = DOMPurify(window);    // DOMPurify es una librería que limpia el contenido de HTML y XSS

const createBlog = async (req: Request, res: Response): Promise<void> => {

  try {

    const  { title, content, banner, status } = req.body as BlogData;
    const userId = req.userId;

    const cleanContent = purify.sanitize(content); // Elimina cualquier código malicioso que pudiera tener la entrada

    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status,
      author: userId
    });

    logger.info('New blog created', newBlog)

    res.status(201).json({
      blog: newBlog
    })

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error during blog creation', error)
  }
}

export default  createBlog 