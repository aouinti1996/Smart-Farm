import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Company, User, Role } from '../models';

// Create a new company (Super Admin only)
export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, domain } = req.body;

    // Check if company with domain already exists
    const existingCompany = await Company.findOne({ where: { domain } });
    if (existingCompany) {
      res.status(400).json({ message: 'Company with this domain already exists' });
      return;
    }

    // Create company
    const company = await Company.create({
      name,
      domain,
      status: 'active'
    });

    res.status(201).json({ company });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all companies (Super Admin only)
export const getAllCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const companies = await Company.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'status'],
          required: false
        }
      ]
    });

    res.status(200).json({ companies });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get company by ID (Super Admin or Company Admin of that company)
export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is authorized to view this company
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== parseInt(id, 10)) {
      res.status(403).json({ message: 'Unauthorized to view this company' });
      return;
    }

    const company = await Company.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'status'],
          required: false
        },
        {
          model: Role,
          required: false
        }
      ]
    });

    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    res.status(200).json({ company });
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update company (Super Admin or Company Admin of that company)
export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { name, domain, status } = req.body;

    // Check if user is authorized to update this company
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== parseInt(id, 10)) {
      res.status(403).json({ message: 'Unauthorized to update this company' });
      return;
    }

    // Find company
    const company = await Company.findByPk(id);
    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    // Update company
    if (name) company.name = name;
    if (domain) company.domain = domain;
    
    // Only Super Admin can change company status
    if (status && req.user.Roles.some((role: any) => role.name === 'Super Admin')) {
      company.status = status;
    }

    await company.save();

    res.status(200).json({ company });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete company (Super Admin only)
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find company
    const company = await Company.findByPk(id);
    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    // Delete company
    await company.destroy();

    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

