import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Envía un correo notificando que la contraseña fue cambiada
 * @param {string} to - Dirección de correo del destinatario
 */

const sendPasswordChangeEmail = async (to) => {
    try {
        const mailOptions = {
            from: `"Gestión de Usuarios | AdminDashboard" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Tu contraseña fue cambiada',
            html: `
                <h2>
                    Contraseña actualizada
                </h2>
                <p>
                    Te informamos que tu contraseña fue cambiada correctamente.
                </p>
                <p>
                    Si no realizaste esta acción, te recomendamos <strong>restablecer tu contraseña</strong> inmediatamente.
                </p>
                <p>
                    Podés hacerlo desde la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.
                </p>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar correo de cambio de contraseña:', error);
        throw error;
    }
};

export default sendPasswordChangeEmail;