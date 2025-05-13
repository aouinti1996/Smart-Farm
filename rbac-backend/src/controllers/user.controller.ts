import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User, Role, Company } from '../models';

// Get all users (Super Admin sees all, Company Admin sees only users in their company)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    let users;

    // If Super Admin, get all users
    if (req.user.Roles.some((role: any) => role.name === 'Super Admin')) {
      users = await User.findAll({
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Role,
            through: { attributes: [] }
          },
          {
            model: Company
          }
        ]
      });
    } else {
      // If Company Admin, get only users in their company
      users = await User.findAll({
        where: { companyId: req.user.companyId },
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Role,
            through: { attributes: [] }
          },
          {
            model: Company
          }
        ]
      });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID (Super Admin or Company Admin of user's company)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          through: { attributes: [] }
        },
        {
          model: Company
        }
      ]
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is authorized to view this user
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== user.companyId) {
      res.status(403).json({ message: 'Unauthorized to view this user' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user (Super Admin can update any user, Company Admin can update users in their company)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { firstName, lastName, status, companyId } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is authorized to update this user
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== user.companyId) {
      res.status(403).json({ message: 'Unauthorized to update this user' });
      return;
    }

    // Update user
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    // Only Super Admin can change user status or company
    if (req.user.Roles.some((role: any) => role.name === 'Super Admin')) {
      if (status) user.status = status;
      if (companyId) user.companyId = companyId;
    }

    await user.save();

    // Get updated user with roles
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          through: { attributes: [] }
        },
        {
          model: Company
        }
      ]
    });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user (Super Admin can delete any user, Company Admin can delete users in their company)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is authorized to delete this user
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== user.companyId) {
      res.status(403).json({ message: 'Unauthorized to delete this user' });
      return;
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    // Delete user
    await user.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Assign role to user (Super Admin can assign any role, Company Admin can only assign roles in their company)
export const assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { userId, roleId } = req.body;

    // Find user and role
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user || !role) {
      res.status(404).json({ message: 'User or role not found' });
      return;
    }

    // Check if user is authorized to assign this role
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin')) {
      // Company Admin can only assign roles in their company
      if (req.user.companyId !== user.companyId) {
        res.status(403).json({ message: 'Unauthorized to modify this user' });
        return;
      }

      // Company Admin can only assign roles that belong to their company
      if (role.companyId !== req.user.companyId) {
        res.status(403).json({ message: 'Unauthorized to assign this role' });
        return;
      }

      // Company Admin cannot assign Super Admin role
      if (role.name === 'Super Admin') {
        res.status(403).json({ message: 'Unauthorized to assign Super Admin role' });
        return;
      }
    }

    // Assign role to user
    await user.$add('role', role);

    // Get updated user with roles
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Assign role to user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove role from user (Super Admin can remove any role, Company Admin can only remove roles in their company)
export const removeRoleFromUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roleId } = req.params;

    // Find user and role
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user || !role) {
      res.status(404).json({ message: 'User or role not found' });
      return;
    }

    // Check if user is authorized to remove this role
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin')) {
      // Company Admin can only modify users in their company
      if (req.user.companyId !== user.companyId) {
        res.status(403).json({ message: 'Unauthorized to modify this user' });
        return;
      }

      // Company Admin can only remove roles that belong to their company
      if (role.companyId !== req.user.companyId) {
        res.status(403).json({ message: 'Unauthorized to remove this role' });
        return;
      }

      // Company Admin cannot remove Super Admin role
      if (role.name === 'Super Admin') {
        res.status(403).json({ message: 'Unauthorized to remove Super Admin role' });
        return;
      }
    }

    // Remove role from user
    await user.$remove('role', role);

    // Get updated user with roles
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Remove role from user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

