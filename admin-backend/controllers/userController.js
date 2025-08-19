import User from '../models/User.js';

// Listar usuarios para un panel admin
export const listUsers = async (req, res) => {
    try {
        const users = await User.find({}, '_id username email role verified avatar');
        res.json(users);
    } catch (error) {
        console.error('listUsers:', error);
        res.status(500).json({ message: 'Error al listar usuarios' });
    }
};

// Para cambiar el rol de un usuario
export const updateUserRole = async (req, res) => {
    try {
        const { userId, newRole } = req.body;
    
        // Se valida que newRole sea permitido
        if (!['admin', 'user'].includes(newRole)) return res.status(400).json({ message: 'Rol inválido' });
    
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
        user.role = newRole;
        await user.save();
    
        res.status(200).json({ message: 'Rol actualizado', user });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
    }
};