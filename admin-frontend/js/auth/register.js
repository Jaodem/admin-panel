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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        // Si ya estaba registrado pero no verificado, también redirigimos
        if (data.alreadyRegistered) {
            sessionStorage.setItem('pendingEmail', email);
            showMessage(messageDiv, 'Ya estás registrado pero no verificaste tu cuenta. Te reenviamos el enlace. Redirigiendo a verificación...', 'info');
            setTimeout(() => {
                window.location.href = 'check-email.html';
            }, 5000);
            return;
        }

        if (res.ok) {
            sessionStorage.setItem('pendingEmail', email);
            showMessage(messageDiv, 'Registro exitoso. Por favor, revisá tu correo para verificar tu cuenta. Redirigiendo a verificación....', 'success');
            form.reset();
            setTimeout(() => {
                window.location.href = 'check-email.html';
            }, 5000);
            return;
        }

        throw Error(data.message || 'Error al registrar');
    } catch (error) {
        console.error(error);
        showMessage(messageDiv, error.message, 'error');
    }
});
