import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import routes from './routes';
import { User, Role, Permission } from './models';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Allow cookies with CORS
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret')); // Parse cookies

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create default roles and permissions if they don't exist
    await createDefaultRolesAndPermissions();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Create default roles and permissions
const createDefaultRolesAndPermissions = async () => {
  try {
    // Create default permissions
    const defaultPermissions = [
      { name: 'user:read', description: 'Can read user information' },
      { name: 'user:write', description: 'Can create and update users' },
      { name: 'user:delete', description: 'Can delete users' },
      { name: 'role:read', description: 'Can read role information' },
      { name: 'role:write', description: 'Can create and update roles' },
      { name: 'role:delete', description: 'Can delete roles' },
      { name: 'permission:read', description: 'Can read permission information' },
      { name: 'permission:write', description: 'Can create and update permissions' },
      { name: 'permission:delete', description: 'Can delete permissions' },
      { name: 'company:read', description: 'Can read company information' },
      { name: 'company:write', description: 'Can create and update companies' },
      { name: 'company:delete', description: 'Can delete companies' },
      { name: 'invitation:read', description: 'Can read invitation information' },
      { name: 'invitation:write', description: 'Can create and update invitations' },
      { name: 'invitation:delete', description: 'Can delete invitations' },
    ];

    for (const permissionData of defaultPermissions) {
      await Permission.findOrCreate({
        where: { name: permissionData.name },
        defaults: permissionData
      });
    }

    // Create Super Admin role
    const [superAdminRole] = await Role.findOrCreate({
      where: { name: 'Super Admin' },
      defaults: {
        name: 'Super Admin',
        description: 'Has full access to all resources',
        companyId: null // Global role
      }
    });

    // Create Company Admin role
    const [companyAdminRole] = await Role.findOrCreate({
      where: { name: 'Company Admin' },
      defaults: {
        name: 'Company Admin',
        description: 'Has full access to company resources',
        companyId: null // Template role, will be assigned to specific companies
      }
    });

    // Create User role
    const [userRole] = await Role.findOrCreate({
      where: { name: 'User' },
      defaults: {
        name: 'User',
        description: 'Regular user with limited access',
        companyId: null // Template role, will be assigned to specific companies
      }
    });

    // Get all permissions
    const permissions = await Permission.findAll();

    // Assign all permissions to Super Admin role
    await superAdminRole.$set('permissions', permissions);

    // Assign company-specific permissions to Company Admin role
    const companyAdminPermissions = permissions.filter(p => 
      p.name !== 'company:delete' && 
      !p.name.startsWith('permission:')
    );
    await companyAdminRole.$set('permissions', companyAdminPermissions);

    // Assign basic permissions to User role
    const userPermissions = permissions.filter(p => 
      p.name === 'user:read' || 
      p.name === 'role:read'
    );
    await userRole.$set('permissions', userPermissions);

    console.log('Default roles and permissions created successfully');
  } catch (error) {
    console.error('Error creating default roles and permissions:', error);
    throw error;
  }
};

// Start the application
initializeApp();

