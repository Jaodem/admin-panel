import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorizateRoles } from '../middlewares/roleMiddleware.js';
import { listUsers, getMyProfile, getProfile } from '../controllers/userController.js';
import { updateUserRole } from '../controllers/userController.js';

const router = express.Router();

// Solo admin
// Listar todos los usuarios
router.get('/', verifyToken, authorizateRoles('admin'), listUsers);

// Mostrar el perfil del usuario
router.get('/me', verifyToken, getMyProfile);

// Mostrar perfil de cualquier usuario (solo admin)
router.get('/:id', verifyToken, authorizateRoles('admin'), getProfile);

// Actualizar rol
router.put('/role', verifyToken, authorizateRoles('admin'), updateUserRole);

export default router;