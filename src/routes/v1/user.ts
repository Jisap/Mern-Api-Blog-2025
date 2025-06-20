import deleteCurrentUser from "@/controllers/v1/user/delete_current_user";
import deletetUser from "@/controllers/v1/user/delete_user";
import getAllUser from "@/controllers/v1/user/get_all_user";
import getCurrentUser from "@/controllers/v1/user/get_current_user";
import getUser from "@/controllers/v1/user/get_user";
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
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('first_name')
    .optional()
    .isLength({ max: 20 })
    .withMessage('First name must be less than 20'),
  body('last_name')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Last name must be less than 20'),
  body(['website', 'facebook', 'instagram', 'linkedin', 'x', 'youtube'])
    .optional()
    .isURL()
    .withMessage('Social links must be a valid URL')
    .isLength({ max: 100 })
    .withMessage('Social links must be less than 100 characters'),
  validationError,
  updateCurrentUser
)

router.delete(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser
)

router.get(
  "/",
  authenticate,
  authorize(['admin']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  validationError,
  getAllUser
)

router.get(
  "/:userId",
  authenticate,
  authorize(['admin']),
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  validationError,
  getUser
,
)

router.delete(
  "/:userId",
  authenticate,
  authorize(['admin']),
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  validationError,
  deletetUser
,
)


export default router;