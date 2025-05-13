import express from 'express';
import { body } from 'express-validator';
import * as roleController from '../controllers/role.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new role (Super Admin can create global roles, Company Admin can create roles for their company)
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Role name is required'),
    body('description').optional(),
    body('companyId').optional().isNumeric(),
  ],
  roleController.createRole
);

// Get all roles (Super Admin sees all, Company Admin sees only roles in their company)
router.get('/', roleController.getAllRoles);

// Get role by ID (Super Admin or Company Admin of role's company)
router.get('/:id', roleController.getRoleById);

// Update role (Super Admin can update any role, Company Admin can update roles in their company)
router.put(
  '/:id',
  [
    body('name').optional(),
    body('description').optional(),
  ],
  roleController.updateRole
);

// Delete role (Super Admin can delete any role, Company Admin can delete roles in their company)
router.delete('/:id', roleController.deleteRole);

// Assign permission to role (Super Admin can assign any permission, Company Admin can only assign to roles in their company)
router.post(
  '/assign-permission',
  [
    body('roleId').notEmpty().isNumeric().withMessage('Role ID is required'),
    body('permissionId').notEmpty().isNumeric().withMessage('Permission ID is required'),
  ],
  roleController.assignPermissionToRole
);

// Remove permission from role (Super Admin can remove any permission, Company Admin can only modify roles in their company)
router.delete('/remove-permission/:roleId/:permissionId', roleController.removePermissionFromRole);

export default router;

