import { showMessage } from "../utils/showMessage.js";
import { addPasswordToggle } from "../components/togglePasswordVisibility.js";

const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const messageDiv = document.getElementById('message');

// Activar funcionalidad de mostrar/ocultar contraseña
addPasswordToggle('#password', '#togglePassword');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = document.getElementById('identifier').value.trim();
    const password = passwordInput.value.trim();

    if (!identifier || !password) {
        showMessage(messageDiv, 'Completá todos los campos', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(messageDiv, data.message || 'Error al iniciar sesión', 'error');
            return;
        }

        // Guardar el token
        localStorage.setItem('token', data.token);

        // Guardar datos básicos del usuario para el navbar
        localStorage.setItem('user', JSON.stringify({
            username: data.user?.username,
            role: data.user?.role || 'user',
            avatar: data.user?.avatar
        }));

        // Redirigir al panel
        showMessage(messageDiv, 'Redirigiendo al panel...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 3000);
    } catch (error) {
        console.error(error);
        showMessage(messageDiv, 'Error de conexión con el servidor', 'error');
    }
});