import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Company status enum
export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// Company attributes interface
interface CompanyAttributes {
  id: number;
  name: string;
  domain: string;
  status: CompanyStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Company creation attributes
interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Company model class
class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  public id!: number;
  public name!: string;
  public domain!: string;
  public status!: CompanyStatus;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
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
    domain: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CompanyStatus)),
      allowNull: false,
      defaultValue: CompanyStatus.ACTIVE,
    },
  },
  {
    sequelize,
    tableName: 'companies',
  }
);

export default Company;

