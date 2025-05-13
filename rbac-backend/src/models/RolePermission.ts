import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

// RolePermission model class for the junction table
class RolePermission extends Model {
  public roleId!: number;
  public permissionId!: number;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    permissionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
  }
);

export default RolePermission;

