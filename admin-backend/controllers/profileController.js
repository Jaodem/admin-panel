import User from '../models/User.js';

// Obtener datos del perfil
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('_id username email role avatar');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
};

// Subir o actualizar avatar
export const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo' });

        // URL absoluta para que funcione desde cualquier puerto
        const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            userId,
            { avatar: avatarUrl },
            { new: true }
        ).select('_id username email avatar');

        res.status(200).json({
            message: 'Avatar actualizado correctamente',
            avatar: user.avatar
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al subir el avatar',
            error: error.message
        });
    }
};