import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendVerificationEmail from '../emails/sendVerificationEmail.js';

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (!existingUser.verified) {
                // Se reenvía el correo de verificación
                await sendVerificationEmail(existingUser.email, existingUser.verificationToken);
                return res.status(200).json({
                    message: 'Ya estás registrado pero no verificaste tu cuenta. Revisá tu correo.',
                    alreadyRegistered: true,
                });
            }
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Validación básica
        if (!username || !email || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' });

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario sin el token
        let newUser = new User({
            username,
            email,
            password: hashedPassword,
            verified: false
        });

        // Guardar usuario para que tenga _id generado
        newUser = await newUser.save();

        // Crear token JWT para verificación con el _id ya generado
        const verificationToken = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Guardar token en el usuario
        newUser.verificationToken = verificationToken;
        await newUser.save();

        // Enviar correo con token JWT
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            message: 'Usuario registrado. Verificá tu correo electrónico',
            userId: newUser._id
        });
    } catch (error) {
        console.error('Error en registerUser:', error);
        res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Válidación básica
    if (!email || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (!user.verified) {
            return res.status(401).json({
                message: 'Tu cuenta aún no fue verificada. Revisá tu correo o solicitá un nuevo enlace.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas' });

        // Se genera el toke
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h'}
        );

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                _id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
}

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
}

export const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!email) return res.status(400).json({ message: 'El correo electrónico es requerido.' });

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
}