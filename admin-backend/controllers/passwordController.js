import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import User from '../models/User.js';
import sendPasswordChangeEmail from '../emails/sendPasswordChangedEmail.js';
import sendPasswordResetEmail from '../emails/sendPasswordResetEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cambiar la contraseña estando logueado
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    try {
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Validar contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordChangedAt = new Date();

        await user.save();

        // Notificar por correo
        await sendPasswordChangeEmail(user.email);

        return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};

// Solicitar restablecimiento de contraseña
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'El email es obligatorio' });

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Por seguridad no se revela si el usuario existe
            return res.status(200).json({ message: 'Si existe una cuenta con ese email, se enviará un enlace para restablecer la contraseña' });
        }

        // Se genera un token seguro
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Se guarda el token y expiración en usuario
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

        await user.save();

        // Se envía el mail
        await sendPasswordResetEmail(user.email, resetToken);

        return res.status(200).json({ message: 'Si existe una cuenta con ese email, se enviará un enlace para restablecer la contraseña' });
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};

// Restablecer contraseña con token
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) return res.status(400).json({ message: 'Token y nueva contraseña son obligatorios' });

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Token inválido o expirado' });

        // Se encripta la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordChangedAt = new Date();

        // Se limpia el token y la expiración
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        // Se notifica por correo
        await sendPasswordChangeEmail(user.email);

        return res.status(200).json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};

export const validateResetToken = async (req, res) => {
    const token = req.query.token;

    if (!token) return res.status(400).json({ valid: false, message: 'Token no proporcionado' });

    try {
        // Se hashea el token para comparar
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Se busca el usuario con el token válido y no expirado
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            // Token inválido o expirado
            return res.status(400).json({ valid: false, message: 'Token inválido o expirado' });
        }

        // Token válido
        return res.json({ valid: true, username: user.username || user.email });
    } catch (error) {
        console.error('Error validando token:', error);
        res.status(500).json({ valid: false, message: 'Error interno del servidor' });
    }
};