import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Super Admin sees all, Company Admin sees only users in their company)
router.get('/', userController.getAllUsers);

// Get user by ID (Super Admin or Company Admin of user's company)
router.get('/:id', userController.getUserById);

// Update user (Super Admin can update any user, Company Admin can update users in their company)
router.put(
  '/:id',
  [
    body('firstName').optional(),
    body('lastName').optional(),
    body('status').optional().isIn(['active', 'pending', 'inactive']),
    body('companyId').optional().isNumeric(),
  ],
  userController.updateUser
);

// Delete user (Super Admin can delete any user, Company Admin can delete users in their company)
router.delete('/:id', userController.deleteUser);

// Assign role to user (Super Admin can assign any role, Company Admin can only assign roles in their company)
router.post(
  '/assign-role',
  [
    body('userId').notEmpty().isNumeric().withMessage('User ID is required'),
    body('roleId').notEmpty().isNumeric().withMessage('Role ID is required'),
  ],
  userController.assignRoleToUser
);

// Remove role from user (Super Admin can remove any role, Company Admin can only remove roles in their company)
router.delete('/remove-role/:userId/:roleId', userController.removeRoleFromUser);

export default router;

