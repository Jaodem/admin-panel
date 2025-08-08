import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import sendPasswordChangeEmail from '../emails/sendPasswordChangedEmail.js';

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

        await sendPasswordChangeEmail(user.email);

        return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    }
};