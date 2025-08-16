import { requireAuth } from '../utils/authGuard.js';
import { renderNavbar } from '../components/navbar.js';
import { decodeToken } from '../utils/decodeToken.js';

(() => {
    if (!requireAuth()) return;

    renderNavbar('profile');

    const API_BASE = 'http://localhost:3000';

    const token = localStorage.getItem('token'); // No sé

    const profilePhoto = document.getElementById('profilePhoto');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const changePhotoBtn = document.getElementById('changePhotoBtn');

    // Cargar perfil desde el backend
    const loadProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw Error('No se pudo cargar el perfil');
            const user = await res.json();

            document.getElementById('username').textContent = user.username || 'Desconocido';
            document.getElementById('email').textContent = user.email || 'Desconocido';

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
            alert('No se pudo subir la imagen');
            // Volver a la imagen anterior si falla
            profilePhoto.src = previousSrc;
        } finally {
            URL.revokeObjectURL(previewUrl);
        }
    });
})();