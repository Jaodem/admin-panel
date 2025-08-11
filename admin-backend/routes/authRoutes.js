import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { verifyEmail, resendVerificationEmail } from '../controllers/emailVerificationController.js';
import { changePassword, forgotPassword, resetPassword, validateResetToken } from '../controllers/passwordController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint para el manejo de usuarios
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

// Ruta protegida
router.get('/profile', verifyToken, (req, res) => {
    res.json({ message: 'Acceso autorizado', userId: req.userId });
});

export default router;