"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const db_1 = require("../database/db");
const supabase_1 = require("../database/supabase");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
class AuthService {
    buildAuthResponse(user) {
        const tokens = (0, jwt_1.generateTokens)({
            userId: user.id,
            email: user.email,
            role: user.role,
            username: user.username
        });
        const { password_hash, reset_token, ...sanitizedUser } = user;
        return { user: sanitizedUser, tokens };
    }
    async register(data) {
        const emailLower = data.email.toLowerCase().trim();
        const usernameClean = data.username.trim();
        // 1. Supabase REST API
        if (supabase_1.supabase) {
            const [byEmail, byUsername] = await Promise.all([
                supabase_1.supabase.from('users').select('id').eq('email', emailLower).maybeSingle(),
                supabase_1.supabase.from('users').select('id').eq('username', usernameClean).maybeSingle()
            ]);
            if (byEmail.error)
                throw new Error(byEmail.error.message);
            if (byUsername.error)
                throw new Error(byUsername.error.message);
            if (byEmail.data || byUsername.data) {
                throw new Error('El correo electrónico o nombre de usuario ya está registrado');
            }
            const pwdHash = await (0, password_1.hashPassword)(data.password);
            const { data: user, error } = await supabase_1.supabase
                .from('users')
                .insert([
                {
                    email: emailLower,
                    username: usernameClean,
                    password_hash: pwdHash,
                    wallet_address: data.walletAddress || null,
                    role: 'user'
                }
            ])
                .select('id, email, username, role, created_at')
                .single();
            if (error || !user) {
                throw new Error(error?.message || 'Error al registrar usuario en Supabase');
            }
            return this.buildAuthResponse(user);
        }
        // 2. Respaldo PostgreSQL local
        if (db_1.db.isPostgresActive) {
            const existing = await db_1.db.query('SELECT id FROM users WHERE email = $1 OR username = $2', [emailLower, usernameClean]);
            if (existing.rows.length > 0) {
                throw new Error('El correo electrónico o nombre de usuario ya está registrado');
            }
            const pwdHash = await (0, password_1.hashPassword)(data.password);
            const insertRes = await db_1.db.query(`INSERT INTO users (email, username, password_hash, wallet_address, role)
         VALUES ($1, $2, $3, $4, 'user')
         RETURNING id, email, username, role, created_at`, [emailLower, usernameClean, pwdHash, data.walletAddress || null]);
            return this.buildAuthResponse(insertRes.rows[0]);
        }
        // 3. Modo Memoria Fallback
        const store = db_1.db.getInMemoryStore();
        const exists = store.users.find(u => u.email === emailLower || u.username === usernameClean);
        if (exists) {
            throw new Error('El correo electrónico o nombre de usuario ya está registrado');
        }
        const pwdHash = await (0, password_1.hashPassword)(data.password);
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
        return this.buildAuthResponse(newUser);
    }
    async login(data) {
        const emailLower = data.email.toLowerCase().trim();
        // 1. Supabase REST API
        if (supabase_1.supabase) {
            const { data: user, error } = await supabase_1.supabase
                .from('users')
                .select('*')
                .eq('email', emailLower)
                .maybeSingle();
            if (error)
                throw new Error(error.message);
            if (!user)
                throw new Error('Credenciales inválidas');
            const isValid = await (0, password_1.comparePassword)(data.password, user.password_hash);
            if (!isValid)
                throw new Error('Credenciales inválidas');
            await supabase_1.supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);
            return this.buildAuthResponse(user);
        }
        // 2. Respaldo PostgreSQL local
        if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query('SELECT * FROM users WHERE email = $1', [emailLower]);
            if (res.rows.length === 0) {
                throw new Error('Credenciales inválidas');
            }
            const user = res.rows[0];
            const isValid = await (0, password_1.comparePassword)(data.password, user.password_hash);
            if (!isValid) {
                throw new Error('Credenciales inválidas');
            }
            await db_1.db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
            return this.buildAuthResponse(user);
        }
        // 3. Modo Memoria
        const store = db_1.db.getInMemoryStore();
        const user = store.users.find(u => u.email === emailLower);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }
        const isValid = await (0, password_1.comparePassword)(data.password, user.password_hash);
        if (!isValid) {
            throw new Error('Credenciales inválidas');
        }
        user.last_login = new Date().toISOString();
        return this.buildAuthResponse(user);
    }
    async refreshToken(token) {
        try {
            const payload = (0, jwt_1.verifyRefreshToken)(token);
            return (0, jwt_1.generateTokens)({
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
                username: payload.username
            });
        }
        catch (err) {
            throw new Error('Refresh token inválido o expirado');
        }
    }
    async getMe(userId) {
        if (supabase_1.supabase) {
            const { data: user, error } = await supabase_1.supabase
                .from('users')
                .select('id, email, username, wallet_address, role, created_at, last_login')
                .eq('id', userId)
                .maybeSingle();
            if (error)
                throw new Error(error.message);
            if (!user)
                throw new Error('Usuario no encontrado');
            return user;
        }
        if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query('SELECT id, email, username, wallet_address, role, created_at, last_login FROM users WHERE id = $1', [userId]);
            if (res.rows.length === 0) {
                throw new Error('Usuario no encontrado');
            }
            return res.rows[0];
        }
        const store = db_1.db.getInMemoryStore();
        const user = store.users.find(u => u.id === userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        const { password_hash, reset_token, ...sanitizedUser } = user;
        return sanitizedUser;
    }
    async googleAuth(data) {
        const emailLower = data.email.toLowerCase().trim();
        if (supabase_1.supabase) {
            let { data: user } = await supabase_1.supabase
                .from('users')
                .select('*')
                .eq('google_id', data.googleId)
                .maybeSingle();
            if (!user) {
                const byEmail = await supabase_1.supabase
                    .from('users')
                    .select('*')
                    .eq('email', emailLower)
                    .maybeSingle();
                user = byEmail.data;
            }
            if (!user) {
                const usernameGenerated = data.email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6);
                const dummyHash = await (0, password_1.hashPassword)('GOOGLE_OAUTH_' + Math.random().toString());
                const { data: inserted, error } = await supabase_1.supabase
                    .from('users')
                    .insert([
                    {
                        email: emailLower,
                        username: usernameGenerated,
                        password_hash: dummyHash,
                        google_id: data.googleId,
                        wallet_address: data.walletAddress || null,
                        role: 'user'
                    }
                ])
                    .select('id, email, username, role, created_at')
                    .single();
                if (error || !inserted)
                    throw new Error(error?.message || 'Error al registrar usuario Google');
                user = inserted;
            }
            else {
                await supabase_1.supabase
                    .from('users')
                    .update({ google_id: data.googleId, last_login: new Date().toISOString() })
                    .eq('id', user.id);
            }
            return this.buildAuthResponse(user);
        }
        if (db_1.db.isPostgresActive) {
            let res = await db_1.db.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [data.googleId, emailLower]);
            let user = res.rows[0];
            if (!user) {
                const usernameGenerated = data.email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6);
                const dummyHash = await (0, password_1.hashPassword)('GOOGLE_OAUTH_' + Math.random().toString());
                const insertRes = await db_1.db.query(`INSERT INTO users (email, username, password_hash, google_id, wallet_address, role)
           VALUES ($1, $2, $3, $4, $5, 'user')
           RETURNING id, email, username, role, created_at`, [emailLower, usernameGenerated, dummyHash, data.googleId, data.walletAddress || null]);
                user = insertRes.rows[0];
            }
            else {
                await db_1.db.query('UPDATE users SET google_id = $1, last_login = CURRENT_TIMESTAMP WHERE id = $2', [data.googleId, user.id]);
            }
            return this.buildAuthResponse(user);
        }
        // Modo Memoria
        const store = db_1.db.getInMemoryStore();
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
        }
        else {
            user.google_id = data.googleId;
            user.last_login = new Date().toISOString();
        }
        return this.buildAuthResponse(user);
    }
    /**
     * Genera el token de recuperación y envía el correo electrónico
     */
    async forgotPassword(email) {
        const emailLower = email.toLowerCase().trim();
        let user = null;
        if (supabase_1.supabase) {
            const { data: found } = await supabase_1.supabase
                .from('users')
                .select('id, email, username')
                .eq('email', emailLower)
                .maybeSingle();
            user = found;
        }
        else if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query('SELECT id, email, username FROM users WHERE email = $1', [emailLower]);
            if (res.rows.length > 0) {
                user = res.rows[0];
            }
        }
        else {
            const store = db_1.db.getInMemoryStore();
            user = store.users.find(u => u.email === emailLower);
        }
        if (!user) {
            // Por seguridad, retornar mensaje genérico para no revelar emails registrados
            return {
                success: true,
                message: 'Si el correo electrónico está registrado, recibirás un enlace de recuperación en los próximos minutos.'
            };
        }
        const { generateResetToken } = await Promise.resolve().then(() => __importStar(require('../utils/jwt')));
        const { emailService } = await Promise.resolve().then(() => __importStar(require('./emailService')));
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
    async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            throw new Error('El token y la nueva contraseña son obligatorios');
        }
        if (newPassword.length < 6) {
            throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
        }
        const { verifyResetToken } = await Promise.resolve().then(() => __importStar(require('../utils/jwt')));
        const payload = verifyResetToken(token);
        const newPwdHash = await (0, password_1.hashPassword)(newPassword);
        if (supabase_1.supabase) {
            const { data: updated, error } = await supabase_1.supabase
                .from('users')
                .update({ password_hash: newPwdHash, last_login: new Date().toISOString() })
                .eq('id', payload.userId)
                .select('id, email, username')
                .maybeSingle();
            if (error)
                throw new Error(error.message);
            if (!updated)
                throw new Error('Usuario no encontrado');
            return { success: true, message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' };
        }
        if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query('UPDATE users SET password_hash = $1, last_login = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, username', [newPwdHash, payload.userId]);
            if (res.rows.length === 0) {
                throw new Error('Usuario no encontrado');
            }
            return { success: true, message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' };
        }
        const store = db_1.db.getInMemoryStore();
        const user = store.users.find(u => u.id === payload.userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        user.password_hash = newPwdHash;
        user.last_login = new Date().toISOString();
        return { success: true, message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' };
    }
    /**
     * Verifica el correo electrónico del usuario
     */
    async verifyEmail(userId) {
        if (supabase_1.supabase) {
            const { data, error } = await supabase_1.supabase
                .from('users')
                .update({ email_verified: true })
                .eq('id', userId)
                .select('id, email')
                .maybeSingle();
            if (error)
                throw new Error(error.message);
            if (!data)
                throw new Error('Usuario no encontrado');
            return { success: true, user: data };
        }
        if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query('UPDATE users SET email_verified = true WHERE id = $1 RETURNING id, email', [userId]);
            if (res.rows.length === 0)
                throw new Error('Usuario no encontrado');
            return { success: true, user: res.rows[0] };
        }
        const store = db_1.db.getInMemoryStore();
        const user = store.users.find(u => u.id === userId);
        if (!user)
            throw new Error('Usuario no encontrado');
        user.email_verified = true;
        return { success: true, user: { id: user.id, email: user.email } };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map