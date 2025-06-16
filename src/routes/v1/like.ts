

import { Router } from "express";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import likeBlog from "@/controllers/v1/like/likeBlog";
import { body, param } from "express-validator";
import validationError from "@/middlewares/validationError";



const router = Router();

router.post(
  '/blogs/:blogId',
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

export default router;