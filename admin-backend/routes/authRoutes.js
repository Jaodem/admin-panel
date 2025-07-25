import express from 'express';
import { registerUser } from '../controllers/authController.js';

const router = express.Router();

// Endpoint para registrar un usuario
router.post('/register', registerUser);

export default router;