

import { Router } from "express";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import likeBlog from "@/controllers/v1/like/likeBlog";
import { body, param } from "express-validator";
import validationError from "@/middlewares/validationError";
import unlikeBlog from "@/controllers/v1/like/unlikeBlog";
import commentBlog from "@/controllers/v1/comment/commentBlog";
import getCommentsByBlog from "@/controllers/v1/comment/getCommentsByBlog";
import deleteComment from "@/controllers/v1/comment/deleteComment";



const router = Router();


router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId')
    .isMongoId()
    .withMessage('Invalid blog id'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  validationError,
  commentBlog
);

router.get(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId')
    .isMongoId()
    .withMessage('Invalid blog id'),
  validationError,
  getCommentsByBlog
)

router.delete(
  '/:commentId',
  authenticate,
  authorize(['admin', 'user']),
  param('commentId')
    .isMongoId()
    .withMessage('Invalid comment id'),
  deleteComment
)

export default router;