import express from 'express';
import authRoutes from './auth.routes';
import companyRoutes from './company.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import permissionRoutes from './permission.routes';
import invitationRoutes from './invitation.routes';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/invitations', invitationRoutes);

export default router;

