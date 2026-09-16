"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    transporter = null;
    constructor() {
        this.initTransporter();
    }
    initTransporter() {
        try {
            const host = process.env.SMTP_HOST || 'smtp.gmail.com';
            const port = parseInt(process.env.SMTP_PORT || '587', 10);
            const user = process.env.SMTP_USER || '';
            const pass = process.env.SMTP_PASS || '';
            if (user && pass) {
                this.transporter = nodemailer_1.default.createTransport({
                    host,
                    port,
                    secure: port === 465,
                    auth: { user, pass }
                });
            }
        }
        catch (err) {
            console.warn('[emailService] Configuración SMTP no detectada, operando en modo simulación/consola');
        }
    }
    /**
     * Envía el correo con el enlace y token de recuperación de contraseña
     */
    async sendPasswordResetEmail(toEmail, username, resetToken) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;
        const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #070b14; color: #ffffff; padding: 2rem; border-radius: 16px; border: 1px solid rgba(0, 245, 155, 0.3);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 900; letter-spacing: -0.5px;">
            <span style="color: #00f59b;">VEN</span>FI
          </h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Venezuela • Finanzas & Publicidad</p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.85); padding: 1.75rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Restablecimiento de Contraseña</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Hola <strong>${username}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta en Venfi.
          </p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            Haz clic en el siguiente botón para elegir una nueva contraseña. Este enlace expirará en <strong>1 hora</strong>:
          </p>

          <div style="text-align: center; margin: 2rem 0;">
            <a href="${resetUrl}" style="background: #00f59b; color: #030712; text-decoration: none; padding: 0.85rem 2rem; border-radius: 10px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 0 20px rgba(0, 245, 155, 0.4);">
              Restablecer mi Contraseña
            </a>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
            Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br />
            <a href="${resetUrl}" style="color: #00f59b; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 12px; color: #64748b;">
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
          <p>© 2026 Venfi Venezuela. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
        console.log(`\n======================================================`);
        console.log(`📧 [EMAIL SERVICE] Correo de Recuperación Enviado a: ${toEmail}`);
        console.log(`🔗 ENLACE DE RESTABLECIMIENTO DIRECTO:`);
        console.log(`👉 ${resetUrl}`);
        console.log(`======================================================\n`);
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: `"Venfi Soporte" <${process.env.SMTP_FROM || 'no-reply@venfi.app'}>`,
                    to: toEmail,
                    subject: '🔑 Restablecer Contraseña - Venfi',
                    html: htmlContent
                });
                return { success: true, resetUrl, delivered: true };
            }
            catch (err) {
                console.warn('[emailService] Error al enviar correo vía SMTP:', err.message);
            }
        }
        return { success: true, resetUrl, delivered: false, simulated: true };
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map