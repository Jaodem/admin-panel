import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendVerificationEmail from '../emails/sendVerificationEmail.js';

export const verifyEmail = async (req, res) => {
    const { token } = req.query;
    console.log('Token recibido:', token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (user.verified) return res.status(400).json({ message: 'La cuenta ya fue verificada.' });

        user.verified = true;
        await user.save();

        res.status(200).json({ message: 'Cuenta verificada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Token inválido o expirado' });
    }
};

export const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) return res.status(400).json({ message: 'El correo electrónico es requerido.' });

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

        if (user.verified) return res.status(400).json({ message: 'La cuenta ya está verificada.' });

        // Generar un nuevo token de verificación
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await sendVerificationEmail(user.email, token);

        res.status(200).json({ message: 'Correo de verificación reenviado.' });
    } catch (error) {
        console.error('Error al reenviar verificación:', error);
        res.status(500).json({ message: 'Error al reenviar verificación.' });
    }
};