import { requireAuth } from '../utils/authGuard.js';
import { renderNavbar } from '../components/navbar.js';
import { decodeToken } from '../utils/decodeToken.js';
import { showMessage } from '../utils/showMessage.js';
import { addPasswordToggle } from '../components/togglePasswordVisibility.js';

(() => {
    if (!requireAuth()) return;

    renderNavbar('profile');

    // Mostrar/ocultar contraseña
    addPasswordToggle('#deletePassword', '#toggleDeletePassword')

    const API_BASE = 'http://localhost:3000';

    const token = localStorage.getItem('token'); // No sé

    const profilePhoto = document.getElementById('profilePhoto');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const messageContainer = document.getElementById('message');

    // Botón eliminar cuenta
    const deleteBtn = document.getElementById('deleteAccountBtn');
    const deleteModal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Cargar perfil desde el backend
    const loadProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw Error('No se pudo cargar el perfil');
            const user = await res.json();

            document.getElementById('username').textContent = user.username || 'Desconocido';
            document.getElementById('email').textContent = user.email || 'Desconocido';
            document.getElementById('role').textContent = user.role || 'Usuario';

            // Normalizar URL del avatar
            const avatarUrl = user.avatar?.startsWith('http')
                ? user.avatar
                : user.avatar
                    ? `${API_BASE}${user.avatar}`
                    : './images/default-avatar.png';

            profilePhoto.src = avatarUrl;
            // Mantener en localStorage para el navbar
            const stored = JSON.parse(localStorage.getItem('user')) || {};
            localStorage.setItem('user', JSON.stringify({
                ...stored,
                username: user.username,
                role: user.role || stored.role || 'user',
                avatar: avatarUrl
            }));
        } catch (error) {
            console.error(error);
            // fallback visual si algo falla
            profilePhoto.src = './images/default-avatar.png';
        }
    };

    loadProfile();

    // Abrir selector 
    changePhotoBtn.addEventListener('click', () => profilePhotoInput.click());

    // Subir nueva foto
    profilePhotoInput.addEventListener('change', async () => {
        const file = profilePhotoInput.files[0];
        if (!file) return;

        // Preview local
        const previewUrl = URL.createObjectURL(file);
        const previousSrc = profilePhoto.src;
        profilePhoto.src = previewUrl;

        // Subir imagen al servidor
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch(`${API_BASE}/api/profile/avatar`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error al subir la imagen');

            const fullUrl = data.avatar.startsWith('http') ? data.avatar : `${API_BASE}${data.avatar}`;

            // Actualizar UI inmediata
            profilePhoto.src = fullUrl;

            // Actualizar navbar + persistir
            const user = JSON.parse(localStorage.getItem('user')) || {};
            user.avatar = fullUrl;
            localStorage.setItem('user', JSON.stringify(user));

            const avatarNav = document.getElementById('userAvatar');
            if (avatarNav) avatarNav.src = fullUrl;

        } catch (error) {
            console.error(error);
            showMessage(messageContainer, 'No se pudo subir la imagen', 'error');
            // Volver a la imagen anterior si falla
            profilePhoto.src = previousSrc;
        } finally {
            URL.revokeObjectURL(previewUrl);
        }
    });

    // Abrir el modal
    deleteBtn.addEventListener('click', () => deleteModal.classList.remove('hidden'));

    // Cancelar
    cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.add('hidden'));

    // Confirmar eliminación con contraseña
    confirmDeleteBtn.addEventListener('click', async () => {
        const password = document.getElementById('deletePassword').value.trim();
        if (!password) {
            showMessage(messageContainer, 'Debes ingresar tu contraseña para eliminar la cuenta', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/profile`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'No se pudo eliminar la cuenta');

            // Mostrar un mensaje de exito
            showMessage(messageContainer, 'Cuenta eliminada satisfactoriamente. Redirigiendo...', 'success');

            // Se limpia storage después de un delay
            setTimeout(() => {
                localStorage.clear();
                window.location.href = 'login.html';
            }, 3000);
        } catch (error) {
            console.error(error);
            showMessage(messageContainer, error.message || 'Error al eliminar la cuenta', 'error');
        }
    });
})();