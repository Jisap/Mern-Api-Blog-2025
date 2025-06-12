import createBlog from "@/controllers/v1/blog/createBlog";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import { Router } from "express";
import { body, param, query } from "express-validator";


const router = Router();

router.post(
  "/",
  authenticate,
  authorize(['admin']),
  createBlog

)

export default router;