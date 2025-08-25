import { requireAuth } from '../utils/authGuard.js';
import { showMessage } from '../utils/showMessage.js'
import { renderNavbar } from '../components/navbar.js';

const API_BASE = 'http://localhost:3000';
const messageDiv = document.getElementById('message');
const usersTableBody = document.querySelector('#usersTable tbody');

// Verificar el acceso
async function checkAdmin() {
    const token = requireAuth();
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        if (!res.ok) throw new Error('No se pudo obtener el usuario');

        const user = await res.json();

        if (user.role !== 'admin') {
            showMessage(messageDiv, 'No tenés permisos para acceder a esta sección. Redirigiendo a dashboard...', 'error');
            setTimeout(() => window.location.href = 'dashboard.html', 3000);
            return null;
        }

        return token;
    } catch (error) {
        showMessage(messageDiv, 'Error al verificar permisos', 'error');
        setTimeout(() => window.location.href = 'dashboard.html', 3000);
        return null;
    }
}

// Cargar y renderizar usuarios
async function loadUsers(token) {
    try {
        const res = await fetch(`${API_BASE}/api/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        if (!res.ok) throw new Error('Error al cargar usuarios');

        let users = await res.json();
        users.sort((a, b) => a.username.localeCompare(b.username));

        renderUsers(users, token);
    } catch (error) {
        showMessage(messageDiv, error.message, 'error');
    }
}

// Renderizar la tabla
async function renderUsers(users, token) {
    usersTableBody.innerHTML = '';

    users.forEach((u) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
             <td class="px-6 py-3">${u._id}</td>
            <td class="px-6 py-3">${u.username}</td>
            <td class="px-6 py-3">${u.email}</td>
            <td class="px-6 py-3">${u.role}</td>
            <td class="px-6 py-3">
                <img src="${u.avatar && u.avatar !== 'null' ? u.avatar : './images/default-avatar.png'}" alt="Avatar" class="w-8 h-8 rounded-full object-cover">
            </td>
            <td class="px-6 py-3">
                <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    data-id="${u._id}" data-role="${u.role}">
                    Cambiar rol
                </button>
            </td>
        `;
        usersTableBody.appendChild(tr);
    });

    // Agregar listeners a botones
    document.querySelectorAll('button[data-id]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            const userId = e.target.dataset.id;
            const currentRole = e.target.dataset.role;
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            await changeUserRole(userId, newRole, token);
        });
    });
}

// Cambiar rol
async function changeUserRole(userId, newRole, token) {
    try {
        const res = await fetch(`${API_BASE}/api/users/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, newRole }),
        });
        if (!res.ok) throw new Error('Error al actualizar el rol');

        showMessage(messageDiv, 'Rol actualizado con éxito', 'success');
        loadUsers(token);
    } catch (error) {
        showMessage(messageDiv, error.message, 'error');
    }
}

// Inicializar
(async function init() {
    renderNavbar('users')
    const token = await checkAdmin();
    if (token) loadUsers(token);
})();