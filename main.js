// Language detection and redirection
const userLang = navigator.language || navigator.userLanguage;
if (!window.location.href.includes('index') && !window.location.href.includes('index-en') && !window.location.href.includes('index-es')) {
    if (userLang.startsWith('fr')) {
        window.location.href = 'index.html';
    } else if (userLang.startsWith('en')) {
        window.location.href = 'index-en.html';
    } else if (userLang.startsWith('es')) {
        window.location.href = 'index-es.html';
    }
}

// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-191XV8D4B1');

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 0
    });
});
