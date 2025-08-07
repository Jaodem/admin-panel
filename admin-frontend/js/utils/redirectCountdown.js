/**
 * Inicia una cuenta regresiva y redirige tras unos segundos
 * @param {HTMLElement} el - Elemento donde mostrar el mensaje
 * @param {string} baseMessage - Texto base antes de los segundos
 * @param {string} colorClass - Clase de color de Tailwind
 * @param {string} redirectTo -Ruta de redirección final
 * @param {number} delaySeconds - Segundos antes de redirigir
 */

export function startRedirectCountdown(el, baseMessage, colorClass, redirectTo, delaySeconds = 5) {
    let secondsLeft = delaySeconds;

    el.className = '';
    el.classList.add(colorClass);

    const updateMessage = () => {
        if (secondsLeft <= 0) {
            window.location.href = redirectTo;
            return;
        }

        const plural = secondsLeft === 1 ? 'segundo' : 'segundos';
        el.textContent = `${baseMessage} ${secondsLeft} ${plural} ...`;

        secondsLeft--;
        setTimeout(updateMessage, 1000);
    };

    updateMessage();
}