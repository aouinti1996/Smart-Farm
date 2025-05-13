import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Permission } from '../models';

// Create a new permission (Super Admin only)
export const createPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, description } = req.body;

    // Check if permission already exists
    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      res.status(400).json({ message: 'Permission with this name already exists' });
      return;
    }

    // Create permission
    const permission = await Permission.create({
      name,
      description
    });

    res.status(201).json({ permission });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all permissions
export const getAllPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json({ permissions });
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get permission by ID
export const getPermissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      res.status(404).json({ message: 'Permission not found' });
      return;
    }

    res.status(200).json({ permission });
  } catch (error) {
    console.error('Get permission by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update permission (Super Admin only)
export const updatePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      res.status(404).json({ message: 'Permission not found' });
      return;
    }

    // Update permission
    if (name) permission.name = name;
    if (description) permission.description = description;

    await permission.save();

    res.status(200).json({ permission });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete permission (Super Admin only)
export const deletePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      res.status(404).json({ message: 'Permission not found' });
      return;
    }

    // Delete permission
    await permission.destroy();

    res.status(200).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

