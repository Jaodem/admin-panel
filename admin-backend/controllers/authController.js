import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendVerificationEmail from '../emails/sendVerificationEmail.js';

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validación básica
        if (!username || !email || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' });

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

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Verificar si es el primer usuario
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'admin' : 'user';

        // Crear usuario sin el token
        let newUser = new User({
            username,
            usernameLower: username.toLowerCase(),
            email,
            password: hashedPassword,
            role,
            verified: false,
            avatar: null
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
            userId: newUser._id,
            role: newUser.role
        });
    } catch (error) {
        console.error('Error en registerUser:', error);
        res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    // Válidación básica
    if (!identifier || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    try {
        // Se normaliza el identifier a minúsculas
        const identifierLower = identifier.toLowerCase();

        // Se busca por email o username (insensible a mayúsculas)
        const user = await User.findOne({
            $or: [
                { email: identifierLower },
                { usernameLower: identifierLower }
            ]
        });

        const isValid = user && user.verified && await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({
                message: 'Credenciales inválidas o cuenta no verificada'
            });
        }

        // Se genera el toke
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};