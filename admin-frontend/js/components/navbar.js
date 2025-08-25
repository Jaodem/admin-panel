export function renderNavbar(currentPage = 'dashboard') {
    const nav = document.createElement('nav');
    nav.className = 'bg-gray-800 text-white sticky top-0 w-full z-50 shadow-md';

    // Obtener datos de usuario almacenados en localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = user.role === 'admin';

    // Construir opciones dinámicas del dropdown
    let links = [];

    if (currentPage === 'dashboard') {
        links.push({ href: 'profile.html', text: 'Mi cuenta' });
        if (isAdmin) links.push({ href: 'users.html', text: 'Usuarios' });
    } else if (currentPage === 'profile') {
        links.push({ href: 'dashboard.html', text: 'Volver al panel' });
        if (isAdmin) links.push({ href: 'users.html', text: 'Usuarios' });
    } else if (currentPage === 'users') {
        links.push({ href: 'dashboard.html', text: 'Volver al panel' });
        links.push({ href: 'profile.html', text: 'Mi cuenta' });
    } else if (currentPage === 'password') {
        links.push({ href: 'profile.html', text: 'Volver al perfil' });
    }

    nav.innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <h1 class="text-xl font-bold">
                Panel de Administración
            </h1>
            <div class="relative flex items-center gap-4">

                <div id="userMenuBtn" class="flex items-center cursor-pointer select-none">
                    <img src="./images/default-avatar.png" alt="Avatar" id="userAvatar" class="w-10 h-10 rounded-full mr-3 object-cover" />
                    <div class="hidden md:block text-white">
                        <div id="userName" class="font-semibold"></div>
                        <div id="userRole" class="text-sm opacity-75 lowercase"></div>
                    </div>
                </div>

                <div id="userDropdown" class="hidden absolute right-0 top-full mt-1 w-48 bg-white text-black rounded shadow-lg z-50">
                    <div class="px-4 py-2 border-b border-gray-200">
                        <p id="dropdownUserName" class="font-semibold"></p>
                        <p id="dropdownUserRole" class="text-sm lowercase opacity-75"></p>
                    </div>
                    ${links.map(link => `
                        <a href="${link.href}" class="block px-4 py-2 hover:bg-gray-100">${link.text}</a>
                    `).join('')}
                    <button id="logoutBtn" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.prepend(nav);

    // Referencias a elementos
    const avatarEl = document.getElementById('userAvatar');
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserRole = document.getElementById('dropdownUserRole');

    // Mostrar avatar default si user.avatar es null/undefined
    avatarEl.src = (user.avatar && user.avatar !== 'null') ? user.avatar : './images/default-avatar.png';

    userNameEl.textContent = user.username || 'Usuario';
    userRoleEl.textContent = user.role || 'user';
    dropdownUserName.textContent = user.username || 'Usuario';
    dropdownUserRole.textContent = user.role || 'user';

    // Mostrar / ocultar dropdown al hacer click
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    userMenuBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('hidden');
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Cerrar dropdown si clickeás afuera
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });
}
