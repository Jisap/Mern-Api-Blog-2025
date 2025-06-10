import getCurrentUser from "@/controllers/v1/user/get_current_user";
import { updateCurrentUser } from "@/controllers/v1/user/update_current_user";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import User from "@/models/user";
import { Router } from "express";
import { body, param, query } from "express-validator";



const router = Router();

router.get(
  '/current',
  authenticate, // header -> token -> verify -> userId -> req.userId -> next
  authorize(['admin', 'user']), // userId -> verificamos si existe en bd -> verificamos si el rol es admin o user -> next
  getCurrentUser
)

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  body('username')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Username must be less than 20 characters')
    .custom( async (value) => {
      const userExists = await User.exists({ username: value });
      if(userExists){
        throw new Error('Username already exists')
      }
    }),
  body('email')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .isEmail()
    .withMessage('Email must be a valid email')
    .custom( async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error('This email is already in use');
      }
    }),
  validationError,
  updateCurrentUser
)


export default router;