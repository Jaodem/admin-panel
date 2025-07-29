import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Se envía un correo de verificación de cuenta
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} token - Token único de verificación
 */

const sendVerificationEmail = async (to, token) => {
    try {
        const verificationLink = `${process.env.FRONTEND_URL}/verificar-email.html?token=${token}`;
    
        const mailOptions = {
            from: `"Gestión de Usuarios | AdminDashboard" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Verificá tu cuenta',
            html: `
                <h2>¡Bienvenido/a!</h2>
                <p>Gracias por registrarte. Para activar tu cuenta, hacé clic en el siguiente enlace:</p>
                <a href="${verificationLink}">Verificar cuenta</a>
                <p>Si no creaste esta cuenta, ignorá este mensaje.</p>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar correo de verificación:', error);
        throw error;
    }
};

export default sendVerificationEmail;