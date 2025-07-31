import { startRedirectCountdown } from "../utils/redirectCountdown.js";

const messageEl = document.getElementById('verification-message');
const redirectDelay = 5;

// Obtener token de la URL
const url = new URL(window.location.href);
const token = url.searchParams.get('token');

if (!token) {
    messageEl.textContent = 'Token de verificación no proporcionado.';
} else {
    
    messageEl.textContent = 'Verificando tu cuenta, por favor espera...';
    
    // Llamada al backend para verificar el token
    fetch(`http://localhost:3000/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
        method: 'GET',
    })
        .then(async (res) => {
            if (!res.ok) {
                // Leer mensaje de error desde el back
                const data = await res.json();
                throw new Error(data.message || 'Error al verificar la cuenta.');
            }
            return res.json();
        })
        .then(() => {
            startRedirectCountdown(
                messageEl,
                'Cuenta verificada correctamente. Serás redirigido al inicio de sesión en',
                'text-green-600',
                'login.html'
            );
        })
        .catch((error) => {
            if (error.message === 'La cuenta ya fue verificada.') {
                startRedirectCountdown(
                    messageEl,
                    'La cuenta ya fue verificada. Serás redirigido al inicio de sesión en',
                    'text-yellow-600',
                    'login.html'
                );
            } else {
                messageEl.textContent = error.message;
                messageEl.classList.add('text-red-600');
            }
        });
}