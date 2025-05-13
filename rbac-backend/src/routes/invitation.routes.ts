import express from 'express';
import { body } from 'express-validator';
import * as invitationController from '../controllers/invitation.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Public endpoint to verify invitation token
router.get('/verify/:token', invitationController.verifyInvitationToken);

// All other routes require authentication
router.use(authenticate);

// Create a new invitation (Super Admin can invite to any company, Company Admin can invite to their company)
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('companyId').notEmpty().isNumeric().withMessage('Company ID is required'),
    body('roleId').notEmpty().isNumeric().withMessage('Role ID is required'),
  ],
  invitationController.createInvitation
);

// Get all invitations (Super Admin sees all, Company Admin sees only invitations for their company)
router.get('/', invitationController.getAllInvitations);

// Get invitation by ID (Super Admin or Company Admin of invitation's company)
router.get('/:id', invitationController.getInvitationById);

// Delete invitation (Super Admin or Company Admin of invitation's company)
router.delete('/:id', invitationController.deleteInvitation);

// Resend invitation (Super Admin or Company Admin of invitation's company)
router.post('/resend/:id', invitationController.resendInvitation);

export default router;

