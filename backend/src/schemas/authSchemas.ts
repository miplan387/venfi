import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Correo electrónico no válido'),
    username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(30),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    walletAddress: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Correo electrónico no válido'),
    password: z.string().min(1, 'La contraseña es obligatoria')
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'El refreshToken es obligatorio')
  })
});

export const googleAuthSchema = z.object({
  body: z.object({
    googleId: z.string().min(1, 'googleId es requerido'),
    email: z.string().email('Correo electrónico no válido'),
    name: z.string().min(1, 'El nombre es obligatorio'),
    walletAddress: z.string().optional()
  })
});
