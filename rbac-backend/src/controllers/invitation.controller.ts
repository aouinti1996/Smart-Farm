import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { Invitation, User, Company, Role } from '../models';
import { sendInvitationEmail } from '../utils/email.utils';

// Create a new invitation (Super Admin can invite to any company, Company Admin can invite to their company)
export const createInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, companyId, roleId } = req.body;

    // Check if user is authorized to create invitation for this company
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== companyId) {
      res.status(403).json({ message: 'Unauthorized to invite users to this company' });
      return;
    }

    // Check if company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      res.status(404).json({ message: 'Company not found' });
      return;
    }

    // Check if role exists and belongs to the company
    const role = await Role.findByPk(roleId);
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    // Company Admin can only assign roles that belong to their company
    if (!req.user.Roles.some((r: any) => r.name === 'Super Admin') && 
        role.companyId !== req.user.companyId) {
      res.status(403).json({ message: 'Unauthorized to assign this role' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      where: {
        email,
        companyId,
        expiresAt: { [Op.gt]: new Date() } // Not expired
      }
    });

    if (existingInvitation) {
      res.status(400).json({ message: 'Invitation for this email already exists' });
      return;
    }

    // Generate token and expiration date (7 days from now)
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await Invitation.create({
      email,
      token,
      companyId,
      roleId,
      invitedBy: req.user.id,
      expiresAt
    });

    // Send invitation email
    await sendInvitationEmail(
      email,
      company.name,
      `${req.user.firstName} ${req.user.lastName}`,
      token
    );

    res.status(201).json({ invitation });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all invitations (Super Admin sees all, Company Admin sees only invitations for their company)
export const getAllInvitations = async (req: Request, res: Response): Promise<void> => {
  try {
    let invitations;

    // If Super Admin, get all invitations
    if (req.user.Roles.some((role: any) => role.name === 'Super Admin')) {
      invitations = await Invitation.findAll({
        include: [
          {
            model: Company
          },
          {
            model: Role
          },
          {
            model: User,
            as: 'Inviter',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });
    } else {
      // If Company Admin, get only invitations for their company
      invitations = await Invitation.findAll({
        where: { companyId: req.user.companyId },
        include: [
          {
            model: Company
          },
          {
            model: Role
          },
          {
            model: User,
            as: 'Inviter',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });
    }

    res.status(200).json({ invitations });
  } catch (error) {
    console.error('Get all invitations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get invitation by ID (Super Admin or Company Admin of invitation's company)
export const getInvitationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findByPk(id, {
      include: [
        {
          model: Company
        },
        {
          model: Role
        },
        {
          model: User,
          as: 'Inviter',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });

    if (!invitation) {
      res.status(404).json({ message: 'Invitation not found' });
      return;
    }

    // Check if user is authorized to view this invitation
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== invitation.companyId) {
      res.status(403).json({ message: 'Unauthorized to view this invitation' });
      return;
    }

    res.status(200).json({ invitation });
  } catch (error) {
    console.error('Get invitation by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete invitation (Super Admin or Company Admin of invitation's company)
export const deleteInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      res.status(404).json({ message: 'Invitation not found' });
      return;
    }

    // Check if user is authorized to delete this invitation
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== invitation.companyId) {
      res.status(403).json({ message: 'Unauthorized to delete this invitation' });
      return;
    }

    // Delete invitation
    await invitation.destroy();

    res.status(200).json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Delete invitation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Resend invitation (Super Admin or Company Admin of invitation's company)
export const resendInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findByPk(id, {
      include: [
        {
          model: Company
        }
      ]
    });

    if (!invitation) {
      res.status(404).json({ message: 'Invitation not found' });
      return;
    }

    // Check if user is authorized to resend this invitation
    if (!req.user.Roles.some((role: any) => role.name === 'Super Admin') && 
        req.user.companyId !== invitation.companyId) {
      res.status(403).json({ message: 'Unauthorized to resend this invitation' });
      return;
    }

    // Generate new token and update expiration date
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update invitation
    invitation.token = token;
    invitation.expiresAt = expiresAt;
    await invitation.save();

    // Send invitation email
    await sendInvitationEmail(
      invitation.email,
      invitation.Company.name,
      `${req.user.firstName} ${req.user.lastName}`,
      token
    );

    res.status(200).json({ message: 'Invitation resent successfully', invitation });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify invitation token (public endpoint)
export const verifyInvitationToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({
      where: {
        token,
        expiresAt: { [Op.gt]: new Date() } // Not expired
      },
      include: [
        {
          model: Company
        },
        {
          model: Role
        }
      ]
    });

    if (!invitation) {
      res.status(404).json({ message: 'Invalid or expired invitation token' });
      return;
    }

    res.status(200).json({
      invitation: {
        email: invitation.email,
        company: invitation.Company.name,
        role: invitation.Role.name
      }
    });
  } catch (error) {
    console.error('Verify invitation token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

