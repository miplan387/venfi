import { randomUUID } from 'crypto';
import { db } from '../database/db';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  public async register(data: { email: string; username: string; password: string; walletAddress?: string }) {
    const emailLower = data.email.toLowerCase().trim();
    const usernameClean = data.username.trim();

    // Comprobar existencia previa
    if (db.isPostgresActive) {
      const existing = await db.query('SELECT id FROM users WHERE email = $1 OR username = $2', [emailLower, usernameClean]);
      if (existing.rows.length > 0) {
        throw new Error('El correo electrónico o nombre de usuario ya está registrado');
      }

      const pwdHash = await hashPassword(data.password);
      const insertRes = await db.query(
        `INSERT INTO users (email, username, password_hash, wallet_address, role)
         VALUES ($1, $2, $3, $4, 'user')
         RETURNING id, email, username, role, created_at`,
        [emailLower, usernameClean, pwdHash, data.walletAddress || null]
      );

      const user = insertRes.rows[0];
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        username: user.username
      });

      return { user, tokens };
    }

    // Modo Memoria Fallback
    const store = db.getInMemoryStore();
    const exists = store.users.find(u => u.email === emailLower || u.username === usernameClean);
    if (exists) {
      throw new Error('El correo electrónico o nombre de usuario ya está registrado');
    }

    const pwdHash = await hashPassword(data.password);
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: emailLower,
      username: usernameClean,
      password_hash: pwdHash,
      wallet_address: data.walletAddress || null,
      role: 'user',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    store.users.push(newUser);

    const tokens = generateTokens({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      username: newUser.username
    });

    const { password_hash, ...sanitizedUser } = newUser;
    return { user: sanitizedUser, tokens };
  }

  public async login(data: { email: string; password: string }) {
    const emailLower = data.email.toLowerCase().trim();

    if (db.isPostgresActive) {
      const res = await db.query('SELECT * FROM users WHERE email = $1', [emailLower]);
      if (res.rows.length === 0) {
        throw new Error('Credenciales inválidas');
      }

      const user = res.rows[0];
      const isValid = await comparePassword(data.password, user.password_hash);
      if (!isValid) {
        throw new Error('Credenciales inválidas');
      }

      await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        username: user.username
      });

      const { password_hash, ...sanitizedUser } = user;
      return { user: sanitizedUser, tokens };
    }

    // Modo Memoria
    const store = db.getInMemoryStore();
    const user = store.users.find(u => u.email === emailLower);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValid = await comparePassword(data.password, user.password_hash);
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    user.last_login = new Date().toISOString();

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username
    });

    const { password_hash, ...sanitizedUser } = user;
    return { user: sanitizedUser, tokens };
  }

  public async refreshToken(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      
      const tokens = generateTokens({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        username: payload.username
      });

      return tokens;
    } catch (err) {
      throw new Error('Refresh token inválido o expirado');
    }
  }

  public async getMe(userId: string) {
    if (db.isPostgresActive) {
      const res = await db.query('SELECT id, email, username, wallet_address, role, created_at, last_login FROM users WHERE id = $1', [userId]);
      if (res.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      return res.rows[0];
    }

    const store = db.getInMemoryStore();
    const user = store.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  public async googleAuth(data: { googleId: string; email: string; name: string; walletAddress?: string }) {
    const emailLower = data.email.toLowerCase().trim();

    if (db.isPostgresActive) {
      let res = await db.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [data.googleId, emailLower]);
      let user = res.rows[0];

      if (!user) {
        const usernameGenerated = data.email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6);
        const dummyHash = await hashPassword('GOOGLE_OAUTH_' + Math.random().toString());
        const insertRes = await db.query(
          `INSERT INTO users (email, username, password_hash, google_id, wallet_address, role)
           VALUES ($1, $2, $3, $4, $5, 'user')
           RETURNING id, email, username, role, created_at`,
          [emailLower, usernameGenerated, dummyHash, data.googleId, data.walletAddress || null]
        );
        user = insertRes.rows[0];
      } else {
        await db.query('UPDATE users SET google_id = $1, last_login = CURRENT_TIMESTAMP WHERE id = $2', [data.googleId, user.id]);
      }

      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        username: user.username
      });

      const { password_hash, ...sanitizedUser } = user;
      return { user: sanitizedUser, tokens };
    }

    // Modo Memoria
    const store = db.getInMemoryStore();
    let user = store.users.find(u => u.google_id === data.googleId || u.email === emailLower);

    if (!user) {
      user = {
        id: `usr_${Date.now()}_google`,
        email: emailLower,
        username: data.email.split('@')[0],
        password_hash: 'GOOGLE_OAUTH',
        google_id: data.googleId,
        wallet_address: data.walletAddress || null,
        role: 'user',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      store.users.push(user);
    } else {
      user.google_id = data.googleId;
      user.last_login = new Date().toISOString();
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username
    });

    const { password_hash, ...sanitizedUser } = user;
    return { user: sanitizedUser, tokens };
  }

  /**
   * Genera el token de recuperación y envía el correo electrónico
   */
  public async forgotPassword(email: string) {
    const emailLower = email.toLowerCase().trim();
    let user: any = null;

    if (db.isPostgresActive) {
      const res = await db.query('SELECT id, email, username FROM users WHERE email = $1', [emailLower]);
      if (res.rows.length > 0) {
        user = res.rows[0];
      }
    } else {
      const store = db.getInMemoryStore();
      user = store.users.find(u => u.email === emailLower);
    }

    if (!user) {
      // Por seguridad, retornar mensaje genérico para no revelar emails registrados
      return {
        success: true,
        message: 'Si el correo electrónico está registrado, recibirás un enlace de recuperación en los próximos minutos.'
      };
    }

    const { generateResetToken } = await import('../utils/jwt');
    const { emailService } = await import('./emailService');

    const resetToken = generateResetToken(user.id, user.email);
    const emailResult = await emailService.sendPasswordResetEmail(user.email, user.username, resetToken);

    return {
      success: true,
      message: 'Si el correo electrónico está registrado, recibirás un enlace de recuperación en los próximos minutos.',
      resetToken, // Retornado para facilitar pruebas locales en caso de no contar con SMTP real
      resetUrl: emailResult.resetUrl
    };
  }

  /**
   * Valida el token y actualiza la contraseña del usuario
   */
  public async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new Error('El token y la nueva contraseña son obligatorios');
    }
    if (newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const { verifyResetToken } = await import('../utils/jwt');
    const payload = verifyResetToken(token);
    const newPwdHash = await hashPassword(newPassword);

    if (db.isPostgresActive) {
      const res = await db.query(
        'UPDATE users SET password_hash = $1, last_login = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, username',
        [newPwdHash, payload.userId]
      );
      if (res.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      return { success: true, message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' };
    }

    const store = db.getInMemoryStore();
    const user = store.users.find(u => u.id === payload.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.password_hash = newPwdHash;
    user.last_login = new Date().toISOString();

    return { success: true, message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' };
  }
}

export const authService = new AuthService();

