import createBlog from "@/controllers/v1/blog/createBlog";
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
)

export default router;