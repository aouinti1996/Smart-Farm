import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Role, Permission } from '../models';

// Create a new role (Super Admin can create global roles, Company Admin can create roles for their company)
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, description, companyId } = req.body;

    // Check if user is authorized to create this role
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin')) {
      // Company Admin can only create roles for their company
      if (companyId !== req.user.companyId) {
        res.status(403).json({ message: 'Unauthorized to create role for this company' });
        return;
      }
    }

    // Create role
    const role = await Role.create({
      name,
      description,
      companyId
    });

    res.status(201).json({ role });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all roles (Super Admin sees all, Company Admin sees only roles in their company)
export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    let roles;

    // If Super Admin, get all roles
    if (req.user.Roles.some((role: any) => role.name === 'Super Admin')) {
      roles = await Role.findAll({
        include: [
          {
            model: Permission,
            through: { attributes: [] }
          }
        ]
      });
    } else {
      // If Company Admin, get only roles in their company
      roles = await Role.findAll({
        where: { 
          [Op.or]: [
            { companyId: req.user.companyId },
            { companyId: null } // Include global roles
          ]
        },
        include: [
          {
            model: Permission,
            through: { attributes: [] }
          }
        ]
      });
    }

    res.status(200).json({ roles });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get role by ID (Super Admin or Company Admin of role's company)
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          through: { attributes: [] }
        }
      ]
    });

    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    // Check if user is authorized to view this role
    if (!req.user.Roles.some((r: any) => r.name === 'Super Admin') && 
        role.companyId !== null && role.companyId !== req.user.companyId) {
      res.status(403).json({ message: 'Unauthorized to view this role' });
      return;
    }

    res.status(200).json({ role });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update role (Super Admin can update any role, Company Admin can update roles in their company)
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    // Check if user is authorized to update this role
    if (!req.user.Roles.some((r: any) => r.name === 'Super Admin')) {
      // Company Admin can only update roles in their company
      if (role.companyId === null || role.companyId !== req.user.companyId) {
        res.status(403).json({ message: 'Unauthorized to update this role' });
        return;
      }
    }

    // Update role
    if (name) role.name = name;
    if (description) role.description = description;

    await role.save();

    // Get updated role with permissions
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json({ role: updatedRole });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete role (Super Admin can delete any role, Company Admin can delete roles in their company)
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    // Check if user is authorized to delete this role
    if (!req.user.Roles.some((r: any) => r.name === 'Super Admin')) {
      // Company Admin can only delete roles in their company
      if (role.companyId === null || role.companyId !== req.user.companyId) {
        res.status(403).json({ message: 'Unauthorized to delete this role' });
        return;
      }
    }

    // Prevent deleting system roles
    if (role.name === 'Super Admin' || role.name === 'Company Admin') {
      res.status(400).json({ message: 'Cannot delete system roles' });
      return;
    }

    // Delete role
    await role.destroy();

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Assign permission to role (Super Admin can assign any permission, Company Admin can only assign to roles in their company)
export const assignPermissionToRole = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { roleId, permissionId } = req.body;

    // Find role and permission
    const role = await Role.findByPk(roleId);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      res.status(404).json({ message: 'Role or permission not found' });
      return;
    }

    // Check if user is authorized to assign this permission
    if (!req.user.Roles.some((r: any) => r.name === 'Super Admin')) {
      // Company Admin can only assign permissions to roles in their company
      if (role.companyId === null || role.companyId !== req.user.companyId) {
        res.status(403).json({ message: 'Unauthorized to modify this role' });
        return;
      }
    }

    // Assign permission to role
    await role.$add('permission', permission);

    // Get updated role with permissions
    const updatedRole = await Role.findByPk(roleId, {
      include: [
        {
          model: Permission,
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json({ role: updatedRole });
  } catch (error) {
    console.error('Assign permission to role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove permission from role (Super Admin can remove any permission, Company Admin can only modify roles in their company)
export const removePermissionFromRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId, permissionId } = req.params;

    // Find role and permission
    const role = await Role.findByPk(roleId);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      res.status(404).json({ message: 'Role or permission not found' });
      return;
    }

    // Check if user is authorized to remove this permission
    if (!req.user.Roles.some((r: any) => r.name === 'Super Admin')) {
      // Company Admin can only modify roles in their company
      if (role.companyId === null || role.companyId !== req.user.companyId) {
        res.status(403).json({ message: 'Unauthorized to modify this role' });
        return;
      }
    }

    // Remove permission from role
    await role.$remove('permission', permission);

    // Get updated role with permissions
    const updatedRole = await Role.findByPk(roleId, {
      include: [
        {
          model: Permission,
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json({ role: updatedRole });
  } catch (error) {
    console.error('Remove permission from role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
