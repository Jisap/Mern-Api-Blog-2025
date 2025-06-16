

import { Router } from "express";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import likeBlog from "@/controllers/v1/like/likeBlog";
import { body, param } from "express-validator";
import validationError from "@/middlewares/validationError";
import unlikeBlog from "@/controllers/v1/like/unlikeBlog";



const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId')
    .isMongoId()
    .withMessage('Invalid blog id'),
  body('userId')
    .notEmpty()
    .withMessage('User id is required')
    .isMongoId()
    .withMessage('Invalid user id'),
  validationError,
  likeBlog,
)

router.delete(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId')
    .isMongoId()
    .withMessage('Invalid blog id'),
  body('userId')
    .notEmpty()
    .withMessage('User id is required')
    .isMongoId()
    .withMessage('Invalid user id'),
  validationError,
  unlikeBlog,
)

export default router;