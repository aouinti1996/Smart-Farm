import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { User, Invitation, Role } from '../models';
import { generateTokens, setTokenCookies, clearTokenCookies, verifyRefreshToken } from '../utils/jwt.utils';
import { sendPasswordResetEmail } from '../utils/email.utils';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, firstName, lastName, invitationToken } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // If invitation token is provided, validate it
    if (invitationToken) {
      const invitation = await Invitation.findOne({
        where: {
          token: invitationToken,
          email,
          expiresAt: { [Op.gt]: new Date() } // Check if not expired
        }
      });

      if (!invitation) {
        res.status(400).json({ message: 'Invalid or expired invitation token' });
        return;
      }

      // Create user with company from invitation
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        companyId: invitation.companyId,
        status: 'active' // Auto-activate users who register via invitation
      });

      // Assign the role from the invitation
      await user.$add('role', invitation.roleId);

      // Delete the used invitation
      await invitation.destroy();

      // Generate tokens and set cookies
      const tokens = generateTokens(user);
      setTokenCookies(res, tokens);

      // Return user data (excluding password)
      const userData = { ...user.toJSON(), password: undefined };
      res.status(201).json({ user: userData });
    } else {
      // Regular registration without invitation (for super admin or public registration if allowed)
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        status: 'pending' // Require activation for users who register without invitation
      });

      // For demo purposes, we'll auto-activate the first user as super admin
      const userCount = await User.count();
      if (userCount === 1) {
        user.status = 'active';
        await user.save();
        
        // Create super admin role and assign to first user
        const superAdminRole = await Role.findOne({ where: { name: 'Super Admin' } });
        if (superAdminRole) {
          await user.$add('role', superAdminRole.id);
        }
      }

      // Generate tokens and set cookies
      const tokens = generateTokens(user);
      setTokenCookies(res, tokens);

      // Return user data (excluding password)
      const userData = { ...user.toJSON(), password: undefined };
      res.status(201).json({ user: userData });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (user.status !== 'active') {
      res.status(403).json({ message: 'Account is not active' });
      return;
    }

    // Generate tokens and set cookies
    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);

    // Return user data (excluding password)
    const userData = { ...user.toJSON(), password: undefined };
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout user
export const logout = (req: Request, res: Response): void => {
  // Clear token cookies
  clearTokenCookies(res);
  res.status(200).json({ message: 'Logged out successfully' });
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token not found' });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      clearTokenCookies(res);
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      clearTokenCookies(res);
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Check if user is active
    if (user.status !== 'active') {
      clearTokenCookies(res);
      res.status(403).json({ message: 'Account is not active' });
      return;
    }

    // Generate new tokens and set cookies
    const tokens = generateTokens(user);
    setTokenCookies(res, tokens);

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal that the user doesn't exist
      res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    
    // Store reset token in database (you might want to create a separate model for this)
    // For simplicity, we'll use a simple approach here
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: new Date() } // Check if not expired
      }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    // Update password
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
