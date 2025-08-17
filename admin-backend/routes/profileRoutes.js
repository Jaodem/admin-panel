import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { getProfile, uploadAvatar } from '../controllers/profileController.js';
import { deleteProfile } from '../controllers/profileController.js';

const router = express.Router();

// Obtener perfil
router.get('/', verifyToken, getProfile);

// Subir avatar
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

// DELETE /api/profile
router.delete('/', verifyToken, deleteProfile);

export default router;