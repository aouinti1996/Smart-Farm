import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    // invitationToken is optional
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

// Logout user
router.post('/logout', authController.logout);

// Refresh access token
router.post('/refresh', authController.refreshToken);

// Request password reset
router.post(
  '/request-password-reset',
  [body('email').isEmail().withMessage('Please provide a valid email')],
  authController.requestPasswordReset
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  authController.resetPassword
);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

export default router;

