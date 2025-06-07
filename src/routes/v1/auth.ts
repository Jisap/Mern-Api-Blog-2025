
import login from '@/controllers/v1/auth/login';
import register from '@/controllers/v1/auth/register';
import validationError from '@/middlewares/validationError';
import User from '@/models/user';
import { Router } from 'express';
import { body } from 'express-validator'; 
import bcrypt from 'bcrypt';



const router = Router();

router.post(
  '/register', 
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required') 
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error('Email or password invalid');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
  validationError,
  register
);

router.post(
  '/login',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 characters')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (!userExists) {
        throw new Error('Email or password invalid');
      }
    }),  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await User.findOne({ email })
        .select('password')
        .lean()
        .exec()
      if (!user) {
        throw new Error('Email or password invalid');
      }

      const passwordMatch = await bcrypt.compare(value, user.password);
      if (!passwordMatch) {
        throw new Error('Email or password invalid');
      }
    }),
    validationError,
  login
)

export default router;