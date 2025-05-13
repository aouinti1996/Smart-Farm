import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Invitation attributes interface
interface InvitationAttributes {
  id: number;
  email: string;
  token: string;
  companyId: number;
  roleId: number;
  invitedBy: number;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Invitation creation attributes
interface InvitationCreationAttributes extends Optional<InvitationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Invitation model class
class Invitation extends Model<InvitationAttributes, InvitationCreationAttributes> implements InvitationAttributes {
  public id!: number;
  public email!: string;
  public token!: string;
  public companyId!: number;
  public roleId!: number;
  public invitedBy!: number;
  public expiresAt!: Date;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Invitation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    companyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    invitedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'invitations',
    indexes: [
      {
        unique: true,
        fields: ['email', 'companyId'],
        name: 'invitations_email_company_unique',
        // This prevents duplicate invitations for the same email in the same company
      },
    ],
  }
);

export default Invitation;

