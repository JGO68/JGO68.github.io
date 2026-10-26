// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-191XV8D4B1');

// Paramètres de campagne autorisés : toute autre clé est ignorée pour empêcher
// l'injection de champs spéciaux Formspree (_cc, _next, _subject, _replyto...).
const ALLOWED_QUERY_PARAMETERS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'gbraid',
    'wbraid',
    'fbclid'
];

// Longueur maximale conservée pour chaque valeur.
const MAX_QUERY_VALUE_LENGTH = 200;

// Keep Google Ads and other campaign parameters available to Formspree submissions.
function preserveQueryParameters() {
    if (!window.location.search) {
        return;
    }

    const forms = document.querySelectorAll('form[data-preserve-query]');
    const params = new URLSearchParams(window.location.search);

    forms.forEach(function(form) {
        params.forEach(function(value, key) {
            // Rejette les clés hors liste blanche et les champs déjà présents.
            if (!ALLOWED_QUERY_PARAMETERS.includes(key) || form.elements.namedItem(key)) {
                return;
            }

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            // Tronque la valeur pour limiter les abus.
            input.value = value.slice(0, MAX_QUERY_VALUE_LENGTH);
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
