import User from '../models/User.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

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

        // Buscar el usuario
        const user = await User.findById(userId);

        // Eliminar el avatar anterior si existe
        if (user.avatar && user.avatar !== 'null') {
            const avatarPatch = path.join('uploads', path.basename(user.avatar));
            if (fs.existsSync(avatarPatch)) fs.unlinkSync(avatarPatch);
        }

        // URL absoluta para la nueva imagen
        const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // Actualizar usuario con el nuevo avatar
        const updateUser = await User.findByIdAndUpdate(
            userId,
            { avatar: avatarUrl },
            { new: true }
        ).select('_id username email avatar');

        res.status(200).json({
            message: 'Avatar actualizado correctamente',
            avatar: updateUser.avatar
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al subir el avatar',
            error: error.message
        });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        if (!password) return res.status(400).json({ message: 'La contraseña es obligatoria' });

        // Buscar usuario
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Validar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

        // Enviar respuesta inmediata al frontend
        res.status(200).json({ message: 'Cuenta eliminada correctamente' });

        // Realizar la eliminación después de unos segundos
        setTimeout(async () => {
            try {
                // Eliminar avatar si existe
                if (user.avatar && user.avatar !== 'null') {
                    const avatarPatch = path.join('uploads', path.basename(user.avatar));
                    if (fs.existsSync(avatarPatch)) fs.unlinkSync(avatarPatch);
                }
                // Eliminar usuario
                await User.findByIdAndDelete(userId);
                console.log(`Usuario ${user.username} eliminado definitivamente`);
            } catch (error) {
                console.error('Error en eliminación diferida:', error);
            }
        }, 4000);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la cuenta', error: error.message });
    }
}