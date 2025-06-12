import createBlog from "@/controllers/v1/blog/createBlog";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import uploadBlogBanner from "@/middlewares/uploadBlogBanner";
import validationError from "@/middlewares/validationError";
import { Router } from "express";
import { body, param, query } from "express-validator";
import multer from 'multer';


const upload = multer()



const router = Router();

router.post(
  "/",
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'),
  uploadBlogBanner('post'),
  validationError,
  createBlog

)

export default router;