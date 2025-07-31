import { startCountdown } from "../utils/startCountdown.js";

const emailInfo = document.getElementById('user-email');
const resendBtn = document.getElementById('resendBtn');
const message = document.getElementById('verification-message');

const pendingEmail = sessionStorage.getItem('pendingEmail');

if (pendingEmail) {
    emailInfo.textContent = `${pendingEmail}`;
} else {
    emailInfo.textContent = 'No se encontró un correo pendiente';
}

// Reenviar correo
resendBtn.addEventListener('click', async() => {
    if (!pendingEmail) return;

    // Se desactiva el botón y se inicia el temporizador
    startCountdown(resendBtn, 60, 'Reenviar correo de verificación');

    try {
        const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: pendingEmail }),
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || 'Error al reenviar el correo';
            return;
        }

        message.textContent = 'Correo reenviado con éxito. Revisá tu bandeja de entrada.';
    } catch(error) {
        console.error(error);
        message.textContent = 'Error de red o del servidor';
    }
});