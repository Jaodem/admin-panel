import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorizateRoles } from '../middlewares/roleMiddleware.js';
import { listUsers } from '../controllers/userController.js';
import { updateUserRole } from '../controllers/userController.js';

const router = express.Router();

// Solo admin
// Listar todos los usuarios
router.get('/users', verifyToken, authorizateRoles('admin'), listUsers);

// Actualizar rol
router.put('/users/role', verifyToken, authorizateRoles('admin'), updateUserRole);

export default router;