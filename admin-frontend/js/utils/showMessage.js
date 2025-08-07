export function showMessage(container, message, type = 'info', duration = 5000) {
    const colors = {
        success: {
            bg: 'bg-green-100',
            border: 'border-green-300',
            text: 'text-green-800'
        },
        error: {
            bg: 'bg-red-100',
            border: 'border-red-300',
            text: 'text-red-800'
        },
        info: {
            bg: 'bg-blue-100',
            border: 'border-blue-300',
            text: 'text-blue-800'
        }
    }

    const color = colors[type] || colors.info;

    container.classList.remove('hidden');

    container.innerHTML = `
        <div class="p-3 rounded-xl text-sm ${color.bg} ${color.border} ${color.text} border">
            ${message}
        </div>
    `;

    setTimeout(() => {
        container.innerHTML = '';
    }, duration);
}