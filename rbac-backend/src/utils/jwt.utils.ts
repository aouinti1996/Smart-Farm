import jwt from 'jsonwebtoken';
import { User } from '../models';

// Token types
interface TokenPayload {
  id: number;
  email: string;
}

interface TokenResponse {
  token: string;
  refreshToken: string;
}

// Generate access token
export const generateAccessToken = (user: User): string => {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// Generate refresh token
export const generateRefreshToken = (user: User): string => {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Generate both tokens
export const generateTokens = (user: User): TokenResponse => {
  return {
    token: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

// Verify refresh token
export const verifyRefreshToken = (refreshToken: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
    ) as TokenPayload;
    
    return decoded;
  } catch (error) {
    return null;
  }
};

// Set tokens in HTTP-only cookies
export const setTokenCookies = (res: any, tokens: TokenResponse): void => {
  // Set access token cookie
  res.cookie('token', tokens.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour in milliseconds
  });

  // Set refresh token cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh', // Only sent to the refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

// Clear token cookies
export const clearTokenCookies = (res: any): void => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh',
    maxAge: 0
  });
};

