import { attachPasswordRules } from '../components/passwordRules.js';
import { addPasswordToggle } from '../components/togglePasswordVisibility.js';
import { showMessage } from '../utils/showMessage.js';
import { requireAuth } from '../utils/authGuard.js';
import { renderNavbar } from '../components/navbar.js';
import { isPasswordStrong } from '../utils/validatePasswordStrength.js';

(() => {
    if (!requireAuth()) return;

    renderNavbar('password');

    // Elementos del DOM
    const form = document.getElementById('changePasswordForm');
    const alertContainer = document.getElementById('alertContainer');

    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    // Mostrar reglas de validación visualmente
    attachPasswordRules(newPasswordInput);

    // Mostrar/ocultar contraseñas
    addPasswordToggle('#currentPassword', '#toggleCurrentPassword');
    addPasswordToggle('#newPassword', '#toggleNewPassword');
    addPasswordToggle('#confirmNewPassword', '#toggleConfirmNewPassword');

    // Enviar formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        // Valida nueva contraseña
        if (!isPasswordStrong(newPassword)) {
            showMessage(alertContainer, 'La nueva contraseña no cumple con los requisitos de seguridad.', 'error');
            return;
        }

        // Confirmación
        if (newPassword !== confirmNewPassword) {
            showMessage(alertContainer, 'Las contraseñas no coinciden.', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Error al cambiar la contraseña');

            showMessage(alertContainer, 'Contraseña cambiada correctamente. Redirigiendo al inicio de sesión...', 'success');
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }, 2500);
        } catch (error) {
            showMessage(alertContainer, error.message, 'error');
        }
    })
})();