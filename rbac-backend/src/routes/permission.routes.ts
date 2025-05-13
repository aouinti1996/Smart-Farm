import express from 'express';
import { body } from 'express-validator';
import * as permissionController from '../controllers/permission.controller';
import { authenticate, isSuperAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new permission (Super Admin only)
router.post(
  '/',
  isSuperAdmin,
  [
    body('name').notEmpty().withMessage('Permission name is required'),
    body('description').optional(),
  ],
  permissionController.createPermission
);

// Get all permissions
router.get('/', permissionController.getAllPermissions);

// Get permission by ID
router.get('/:id', permissionController.getPermissionById);

// Update permission (Super Admin only)
router.put(
  '/:id',
  isSuperAdmin,
  [
    body('name').optional(),
    body('description').optional(),
  ],
  permissionController.updatePermission
);

// Delete permission (Super Admin only)
router.delete('/:id', isSuperAdmin, permissionController.deletePermission);

export default router;

