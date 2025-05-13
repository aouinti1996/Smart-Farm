import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Role attributes interface
interface RoleAttributes {
  id: number;
  name: string;
  description: string;
  companyId: number | null; // null for system-wide roles
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Role creation attributes
interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Role model class
class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public companyId!: number | null;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true, // null means it's a system-wide role
    },
  },
  {
    sequelize,
    tableName: 'roles',
    indexes: [
      {
        unique: true,
        fields: ['name', 'companyId'],
        name: 'roles_name_company_unique',
        // This allows multiple companies to have roles with the same name
        // But prevents duplicate role names within the same company
      },
    ],
  }
);

export default Role;

