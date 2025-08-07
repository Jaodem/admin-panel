export function renderNavbar(currentPage = 'dashboard') {
    const nav = document.createElement('nav');
    nav.className = 'bg-gray-800 text-white sticky top-0 w-full z-50 shadow-md';

    let navLink = '';
    if (currentPage === 'dashboard') navLink = '<a href="profile.html" class="hover:underline">Mi cuenta</a>';
    else if (currentPage === 'profile') navLink = '<a href="dashboard.html" class="hover:underline">Volver al panel</a>';
    else if (currentPage === 'password') navLink = '<a href="profile.html" class="hover:underline">Volver al perfil</a>';;

    nav.innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <h1 class="text-xl font-bold">
                Panel de Administración
            </h1>
            <div class="flex items-center gap-4">
                ${navLink}
                <button id="logoutBtn" class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
                    Cerrar sesión
                </button>
            </div>
        </div>
    `;

    document.body.prepend(nav);

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    })
}