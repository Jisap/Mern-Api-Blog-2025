

import { logger } from "@/lib/winston";
import Blog from "@/models/blog";
import Comment from "@/models/comment";
import Like from "@/models/like";
import type { Request, Response } from 'express';
import type { IComment } from '@/models/comment';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

type CommentData = Pick<IComment, 'content'>

const window = new JSDOM('').window; // DOMPurify necesita un objeto window para funcionar
const purify = DOMPurify(window);    // DOMPurify es una librería que limpia el contenido de HTML y XSS


const commentBlog = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params
  const { content } = req.body as CommentData;
  const  userId  = req.userId;

  try {

    const blog = await Blog.findById(blogId)
      .select('_id commentsCount')
      .exec()

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found'
      })
      return
    }

    const cleanContent = purify.sanitize(content); // Elimina cualquier código malicioso que pudiera tener la entrada

    const newComment = await Comment.create({
      blogId,
      content: cleanContent,
      userId
    });

    logger.info('New comment created', newComment)

    blog.commentsCount++;
    await blog.save()

    logger.info('Blog comments count updated', {
      blogId: blog._id,
      commentsCount: blog.commentsCount
    });

    res.status(201).json({
      comment: newComment
    })

  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error during commenting in blog', error)
  }
}

export default commentBlog 