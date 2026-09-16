"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetToken = exports.generateResetToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, {
        expiresIn: '1h'
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.config.jwtRefreshSecret, {
        expiresIn: '7d'
    });
    return { accessToken, refreshToken, expiresIn: 3600 };
};
exports.generateTokens = generateTokens;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.config.jwtRefreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
const generateResetToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email, type: 'password_reset' }, env_1.config.jwtSecret, {
        expiresIn: '1h'
    });
};
exports.generateResetToken = generateResetToken;
const verifyResetToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
    if (decoded.type !== 'password_reset') {
        throw new Error('Token de tipo inválido');
    }
    return decoded;
};
exports.verifyResetToken = verifyResetToken;
//# sourceMappingURL=jwt.js.map