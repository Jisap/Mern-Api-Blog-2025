
import login from '@/controllers/v1/auth/login';
import register from '@/controllers/v1/auth/register';
import validationError from '@/middlewares/validationError';
import User from '@/models/user';
import { Router } from 'express';
import { body, cookie } from 'express-validator'; 
import bcrypt from 'bcrypt';
import refreshToken from '@/controllers/v1/auth/refresh_Token';



const router = Router();

// Register
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

// Login
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

// Esto un endpoint específico que el cliente llama solo cuando su accessToken ha expirado y necesita obtener uno nuevo, 
// utilizando el refreshToken que se almacenó de forma segura en una cookie.
router.post(
  '/refresh-token',
  cookie('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isJWT()
    .withMessage('Invalid refresh token'),
  validationError,
  refreshToken
)

export default router;