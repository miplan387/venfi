import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  username: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: '1h'
  });

  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: '7d'
  });

  return { accessToken, refreshToken, expiresIn: 3600 };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
};

export const generateResetToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email, type: 'password_reset' }, config.jwtSecret, {
    expiresIn: '1h'
  });
};

export const verifyResetToken = (token: string): { userId: string; email: string; type: string } => {
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  if (decoded.type !== 'password_reset') {
    throw new Error('Token de tipo inválido');
  }
  return decoded;
};
