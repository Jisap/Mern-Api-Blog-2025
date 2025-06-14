import createBlog from "@/controllers/v1/blog/createBlog";
import getAllBlogs from "@/controllers/v1/blog/getAllBlogs";
import getBlogsBySlug from "@/controllers/v1/blog/getBlogsBySlug";
import getBlogsByUser from "@/controllers/v1/blog/getBlogsByUser";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import uploadBlogBanner from "@/middlewares/uploadBlogBanner";
import validationError from "@/middlewares/validationError";
import { Router } from "express";
import { body, param, query } from "express-validator";
import multer from 'multer';


const upload = multer(); // instancia de multer



const router = Router();

router.post(
  "/",
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'), // Intercepta peticiones multipart/form-data con el nombre de archivo banner_image para añadirlo al objeto req.file
  uploadBlogBanner('post'),      // Sube a cloudinary el banner_image y devuelve la URL y el tamaño del archivo
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 180 })
    .withMessage('Title must be at least 180 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status is not supported'),
  validationError,
  createBlog
);

router.get(
  "/",
  authenticate,
  authorize(['admin', 'user']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  validationError,
  getAllBlogs
)

router.get(
  "/user/:userId",
  authenticate,
  authorize(['admin', 'user']),
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  validationError,
  getBlogsByUser
);

router.get(
  "/:slug",
  authenticate,
  authorize(['admin', 'user']),
  param('slug')
    .notEmpty()
    .withMessage('Slug is required'),
  validationError,
  getBlogsBySlug
)

export default router;