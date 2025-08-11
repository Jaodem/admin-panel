import { showMessage } from '../utils/showMessage.js'
import { startCountdown } from '../utils/startCountdown.js';

const form = document.getElementById('recoveryForm');
const emailInput = document.getElementById('email');
const resendBtn = document.getElementById('resendBtn');
const alertContainer = document.getElementById('alertContainer');

// Establecer texto inicial
resendBtn.textContent = 'Enviar enlace de recuperación';

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        showMessage(alertContainer, 'Por favor ingresá un correo electrónico válido.', 'error');
        return;
    }

    // Desactivar el botón y comenzar con la cuenta regresiva
    startCountdown(resendBtn, 60, 'Enviar enlace de recuperación');

    try {
        const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(alertContainer, data.message || 'Ocurrió un error al solicitar el enlace.', 'error');
            return;
        }

        showMessage(alertContainer, 'Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.', 'success');
        form.reset();
    } catch (error) {
        console.error(error);
        showMessage(alertContainer, 'Error de red o del servidor', 'error');
    }
});