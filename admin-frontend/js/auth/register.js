import { addPasswordToggle } from "../components/togglePasswordVisibility.js";
import { attachPasswordRules } from "../components/passwordRules.js";
import { isPasswordValid } from "../utils/validatePasswordStrength.js";
import { showMessage } from "../utils/showMessage.js";

const form = document.getElementById('form-register');
const passwordInput = document.getElementById('password');
const messageDiv = document.getElementById('message');

// Activar validación visual de contraseña
attachPasswordRules(passwordInput);

// Mostrar/ocultar contraseñas (sin esperar DOMContentLoaded)
addPasswordToggle('#password', '#togglePassword');
addPasswordToggle('#confirmPassword', '#toggleConfirmPassword');

// Enviar datos al backend
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener datos del formulario
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Válidación de fortaleza de la contraseña
    if (!isPasswordValid(password)) {
        showMessage(messageDiv, 'La contraseña no cumple con los requisitos mínimos de seguridad.', 'error');
        return;
    }

    // Validación simple de coincidencia de contraseñas
    if (password !== confirmPassword) {
        showMessage(messageDiv, 'Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Error al registrar");

        showMessage(messageDiv, 'Registro exitoso. Por favor, verifica tu correo.', 'success');
        form.reset();
    } catch (error) {
        console.error(error);
        showMessage(messageDiv, error.message, 'error');
    }
});
