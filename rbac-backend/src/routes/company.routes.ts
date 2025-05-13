import express from 'express';
import { body } from 'express-validator';
import * as companyController from '../controllers/company.controller';
import { authenticate, isSuperAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new company (Super Admin only)
router.post(
  '/',
  isSuperAdmin,
  [
    body('name').notEmpty().withMessage('Company name is required'),
    body('domain').notEmpty().withMessage('Domain is required'),
  ],
  companyController.createCompany
);

// Get all companies (Super Admin only)
router.get('/', isSuperAdmin, companyController.getAllCompanies);

// Get company by ID (Super Admin or Company Admin of that company)
router.get('/:id', companyController.getCompanyById);

// Update company (Super Admin or Company Admin of that company)
router.put(
  '/:id',
  [
    body('name').optional(),
    body('domain').optional(),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  companyController.updateCompany
);

// Delete company (Super Admin only)
router.delete('/:id', isSuperAdmin, companyController.deleteCompany);

export default router;

