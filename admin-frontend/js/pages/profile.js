import { requireAuth } from '../utils/authGuard.js';
import { renderNavbar } from '../components/navbar.js';
import { decodeToken } from '../utils/decodeToken.js';

(() => {
    if (!requireAuth()) return;

    renderNavbar('profile');

    const token = localStorage.getItem('token');
    const payload = decodeToken(token);

    if (payload) {
        document.getElementById('username').textContent = payload.username || 'Desconocido';
        document.getElementById('email').textContent = payload.email || 'Desconocido';
    }
})();