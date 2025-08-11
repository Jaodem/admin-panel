import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Se envía un correo con el enlace para restablecer la contraseña
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} token - Token para restablecer la contraseña
 */

const sendPasswordResetEmail = async (to, token) => {
    try {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

        const mailOptions = {
            from: `"Gestión de Usuarios | AdminDashboard" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Restablecer tu contraseña`,
            html: `
                <h2>
                    Restablecer contraseña
                </h2>
                <p>
                    Recibimos una solicitud para restablecer tu contraseña.
                </p>
                <p>
                    Hacé clic en el siguiente enlace para continuar. Este enlace expirará en <strong>1 hora</strong>.
                </p>
                <p>
                    <a href="${resetLink}" target="_blank">${resetLink}</a>
                </p>
                <p>
                    Si no solicitaste este cambio, podés ignorar este correo.
                </p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo de restablecimiento enviado a: ${to}`);
    } catch (error) {
        console.error('Error al enviar correo de restablecimiento:', error);
        throw error;
    }
};

export default sendPasswordResetEmail;