import User from './User';
import Company from './Company';
import Role from './Role';
import Permission from './Permission';
import UserRole from './UserRole';
import RolePermission from './RolePermission';
import Invitation from './Invitation';

// Define associations between models

// Company - User (One-to-Many)
Company.hasMany(User, { foreignKey: 'companyId' });
User.belongsTo(Company, { foreignKey: 'companyId' });

// Company - Role (One-to-Many)
Company.hasMany(Role, { foreignKey: 'companyId' });
Role.belongsTo(Company, { foreignKey: 'companyId' });

// User - Role (Many-to-Many)
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

// Role - Permission (Many-to-Many)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId' });

// Invitation associations
Company.hasMany(Invitation, { foreignKey: 'companyId' });
Invitation.belongsTo(Company, { foreignKey: 'companyId' });

Role.hasMany(Invitation, { foreignKey: 'roleId' });
Invitation.belongsTo(Role, { foreignKey: 'roleId' });

User.hasMany(Invitation, { foreignKey: 'invitedBy', as: 'SentInvitations' });
Invitation.belongsTo(User, { foreignKey: 'invitedBy', as: 'Inviter' });

export {
  User,
  Company,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Invitation
};

