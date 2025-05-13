import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Interface for email options
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Send email function
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'noreply@example.com',
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send invitation email
export const sendInvitationEmail = async (
  email: string,
  companyName: string,
  inviterName: string,
  token: string
): Promise<boolean> => {
  const invitationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;
  
  const html = `
    <h1>You've been invited to join ${companyName}</h1>
    <p>${inviterName} has invited you to join their organization on our platform.</p>
    <p>Click the link below to accept the invitation and create your account:</p>
    <p><a href="${invitationLink}">Accept Invitation</a></p>
    <p>This invitation link will expire in 7 days.</p>
    <p>If you did not expect this invitation, you can safely ignore this email.</p>
  `;

  return sendEmail({
    to: email,
    subject: `Invitation to join ${companyName}`,
    html
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<boolean> => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset for your account.</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html
  });
};

