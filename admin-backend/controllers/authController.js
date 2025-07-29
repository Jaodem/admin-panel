import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendVerificationEmail from '../emails/sendVerificationEmail.js';

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }]});
        if (existingUser) return res.status(400).json({ message: 'El usuario ya existe' });

        const verificationToken = generateToken();

        // Validación básica
        if (!username || !email || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' });

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken
        });

        await newUser.save();

        // Se envía el mail
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