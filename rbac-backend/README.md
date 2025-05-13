# RBAC Backend

A Role-Based Access Control (RBAC) backend application built with Node.js, Express, TypeScript, and MySQL.

## Features

- **User Hierarchy**:
  - Super Admin: Can create companies and define permissions
  - Company Admin: Can invite users and assign roles within their company
  - Regular Users: Have access based on their assigned roles

- **Security Measures**:
  - HTTP-only cookies for JWT storage
  - CSRF protection
  - Password hashing with bcrypt
  - Input validation and sanitization
  - Rate limiting to prevent brute force attacks
  - Secure HTTP headers with helmet

- **Core Functionality**:
  - User authentication (login, logout, password reset)
  - Company management (create, update, delete)
  - User invitation system with email
  - Role and permission management
  - Access control middleware

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd rbac-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=rbac_db
   DB_USER=root
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d

   # Cookie Configuration
   COOKIE_SECRET=your_cookie_secret

   # Email Configuration
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=noreply@example.com

   # Frontend URL (for CORS and email links)
   FRONTEND_URL=http://localhost:3000
   ```

5. Create the MySQL database:
   ```
   mysql -u root -p
   CREATE DATABASE rbac_db;
   exit
   ```

6. Build the application:
   ```
   npm run build
   ```

## Running the Application

### Development Mode

```
npm run dev
```

### Production Mode

```
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Companies

- `POST /api/companies` - Create a new company (Super Admin only)
- `GET /api/companies` - Get all companies (Super Admin only)
- `GET /api/companies/:id` - Get company by ID
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company (Super Admin only)

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/assign-role` - Assign role to user
- `DELETE /api/users/remove-role/:userId/:roleId` - Remove role from user

### Roles

- `POST /api/roles` - Create a new role
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `POST /api/roles/assign-permission` - Assign permission to role
- `DELETE /api/roles/remove-permission/:roleId/:permissionId` - Remove permission from role

### Permissions

- `POST /api/permissions` - Create a new permission (Super Admin only)
- `GET /api/permissions` - Get all permissions
- `GET /api/permissions/:id` - Get permission by ID
- `PUT /api/permissions/:id` - Update permission (Super Admin only)
- `DELETE /api/permissions/:id` - Delete permission (Super Admin only)

### Invitations

- `GET /api/invitations/verify/:token` - Verify invitation token (public)
- `POST /api/invitations` - Create a new invitation
- `GET /api/invitations` - Get all invitations
- `GET /api/invitations/:id` - Get invitation by ID
- `DELETE /api/invitations/:id` - Delete invitation
- `POST /api/invitations/resend/:id` - Resend invitation

## Default Roles and Permissions

The application automatically creates the following default roles and permissions on startup:

### Roles

- **Super Admin**: Has full access to all resources
- **Company Admin**: Has full access to company resources
- **User**: Regular user with limited access

### Permissions

- **user:read**: Can read user information
- **user:write**: Can create and update users
- **user:delete**: Can delete users
- **role:read**: Can read role information
- **role:write**: Can create and update roles
- **role:delete**: Can delete roles
- **permission:read**: Can read permission information
- **permission:write**: Can create and update permissions
- **permission:delete**: Can delete permissions
- **company:read**: Can read company information
- **company:write**: Can create and update companies
- **company:delete**: Can delete companies
- **invitation:read**: Can read invitation information
- **invitation:write**: Can create and update invitations
- **invitation:delete**: Can delete invitations

## License

This project is licensed under the ISC License.

