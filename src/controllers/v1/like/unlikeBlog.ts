import { logger } from "@/lib/winston";
import Blog from "@/models/blog";
import Like from "@/models/like";
import type { Request, Response } from 'express';



const unlikeBlog = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params
  const { userId } = req.body;

  try {

    const existingLike = await Like.findOne({ blogId, userId }) // Verifica si el usuario ya ha hecho like a este blog buscando en la colección likes si existe un like para ese blog por parte de ese user
      .lean()
      .exec()

    if(!existingLike){
      res.status(404).json({
        code: 'NotFound',
        message: 'Like not found',
      })
      return
    }

    await Like.deleteOne({ _id: existingLike._id })

    const blog = await Blog.findById(blogId)
      .select('likes')
      .exec()

    if(!blog){
      res.status(400).json({
        code: 'NotFound',
        message: 'Blog not found',
      })
      return
    }

    blog.likesCount--;
    await blog.save()

    logger.info(`Unliked blog ${blogId} by user ${userId}`);

    res.status(200).json({
      likesCount: blog.likesCount
    })
    
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error
    })
    logger.error('Error during unliking blog', error)
  }
}

export default unlikeBlog 