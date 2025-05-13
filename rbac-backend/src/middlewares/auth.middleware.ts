import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Role, Permission } from '../models';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
    
    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Check if user is active
    if (user.status !== 'active') {
      res.status(403).json({ message: 'Account is not active' });
      return;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Authorization middleware - checks if user has required permission
export const authorize = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // Get user's permissions from roles
      const userPermissions = new Set<string>();
      
      // Extract permissions from user's roles
      if (req.user.Roles) {
        for (const role of req.user.Roles) {
          if (role.Permissions) {
            for (const permission of role.Permissions) {
              userPermissions.add(permission.name);
            }
          }
        }
      }

      // Check if user has the required permission
      if (!userPermissions.has(requiredPermission)) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Super admin middleware - checks if user is a super admin
export const isSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Check if user has super admin role
    const isSuperAdmin = req.user.Roles.some((role: any) => role.name === 'Super Admin');

    if (!isSuperAdmin) {
      res.status(403).json({ message: 'Super admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Company admin middleware - checks if user is an admin of their company
export const isCompanyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Check if user has company admin role
    const isCompanyAdmin = req.user.Roles.some((role: any) => 
      role.name === 'Company Admin' && role.companyId === req.user.companyId
    );

    if (!isCompanyAdmin) {
      res.status(403).json({ message: 'Company admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Company admin check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

