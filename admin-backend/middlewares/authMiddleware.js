import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Se verifica si se envía el token en el header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Se verifica el token y extraemos los datos
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

        // Verificamos si cambió la contraseña después de que se emitió el token
        if (user.passwordChangedAt) {
            const passwordChangedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
            if (decoded.iat < passwordChangedTimestamp) {
                return res.status(401).json({ message: 'Token inválido por cambio de contraseña. Por favor, inicia sesión nuevamente.' });
            }
        }

        req.user = { userId: decoded.userId, role: user.role };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};