// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-191XV8D4B1');

// Keep Google Ads and other campaign parameters available to Formspree submissions.
function preserveQueryParameters() {
    if (!window.location.search) {
        return;
    }

    const forms = document.querySelectorAll('form[data-preserve-query]');
    const params = new URLSearchParams(window.location.search);

    forms.forEach(function(form) {
        params.forEach(function(value, key) {
            if (!key || form.elements.namedItem(key)) {
                return;
            }

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });
    });
}

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 0
        });
    }

    preserveQueryParameters();
});
