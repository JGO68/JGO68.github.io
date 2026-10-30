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

// Clé localStorage : la provenance est gardée entre les pages et les visites.
const ATTRIBUTION_STORAGE_KEY = 'djsh_provenance';

// Durée de conservation : 90 jours, comme la validité d'un gclid Google Ads.
const ATTRIBUTION_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

function truncateValue(value) {
    return String(value).slice(0, MAX_QUERY_VALUE_LENGTH);
}

function readStoredAttribution() {
    try {
        const stored = JSON.parse(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY));
        if (stored && Date.now() - stored.savedAt < ATTRIBUTION_MAX_AGE_MS) {
            return stored;
        }
    } catch (error) {
        // Stockage bloqué ou valeur illisible : on repart de zéro.
    }
    return null;
}

// Mémorise d'où vient le visiteur. Une nouvelle source externe (paramètres de
// campagne ou site référent) remplace l'ancienne; une navigation interne ou une
// visite directe garde la dernière source connue.
function recordAttribution() {
    const campaign = {};
    new URLSearchParams(window.location.search).forEach(function(value, key) {
        if (ALLOWED_QUERY_PARAMETERS.includes(key)) {
            campaign[key] = truncateValue(value);
        }
    });

    let referrer = '';
    try {
        const referrerHost = new URL(document.referrer).hostname;
        if (referrerHost !== window.location.hostname) {
            referrer = truncateValue(referrerHost);
        }
    } catch (error) {
        // Pas de référent (visite directe, application, courriel...).
    }

    const stored = readStoredAttribution();
    if (stored && Object.keys(campaign).length === 0 && !referrer) {
        return stored;
    }

    const attribution = {
        savedAt: Date.now(),
        campaign: campaign,
        referrer: referrer || '(direct)',
        landingPage: truncateValue(window.location.pathname)
    };
    try {
        window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    } catch (error) {
        // Stockage bloqué : la provenance vaut seulement pour cette page.
    }
    return attribution;
}

// Ajoute la provenance aux formulaires Formspree en champs cachés. Les noms de
// champs sont fixes (liste blanche ci-dessus), jamais tirés de l'URL.
function addAttributionFields() {
    const attribution = recordAttribution();
    const fields = {};
    // Revalide les clés relues du stockage contre la liste blanche.
    ALLOWED_QUERY_PARAMETERS.forEach(function(key) {
        if (attribution.campaign && attribution.campaign[key]) {
            fields[key] = truncateValue(attribution.campaign[key]);
        }
    });
    fields.site_referent = truncateValue(attribution.referrer || '(direct)');
    fields.page_arrivee = truncateValue(attribution.landingPage || '');
    fields.page_formulaire = truncateValue(window.location.pathname);

    document.querySelectorAll('form[data-preserve-query]').forEach(function(form) {
        Object.keys(fields).forEach(function(key) {
            // Ne remplace jamais un champ déjà présent dans le formulaire.
            if (form.elements.namedItem(key)) {
                return;
            }

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = fields[key];
            form.appendChild(input);
        });
    });
}

// Galeries de photos (_includes/galerie.html) : flèches de défilement et photo
// agrandie dans une fenêtre. Sans JavaScript, le lien ouvre simplement la photo.
function initGalleries() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-galerie]').forEach(function(gallery) {
        const track = gallery.querySelector('.galerie-piste');
        const previous = gallery.querySelector('[data-galerie-precedent]');
        const next = gallery.querySelector('[data-galerie-suivant]');

        function updateArrows() {
            previous.disabled = track.scrollLeft <= 1;
            next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
        }

        function scrollByPage(direction) {
            track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: reducedMotion ? 'auto' : 'smooth' });
        }

        previous.addEventListener('click', function() { scrollByPage(-1); });
        next.addEventListener('click', function() { scrollByPage(1); });
        track.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        updateArrows();

        gallery.querySelectorAll('[data-galerie-photo]').forEach(function(link) {
            link.addEventListener('click', function(event) {
                if (typeof HTMLDialogElement !== 'function') {
                    return;
                }
                event.preventDefault();
                openPhoto(link.href, link.querySelector('img').alt, gallery.dataset.fermer, link);
            });
        });
    });
}

// Fenêtre de la photo agrandie, créée au premier clic (aucune image vide dans la page).
function openPhoto(source, alt, closeLabel, origin) {
    let dialog = document.querySelector('dialog.galerie-fenetre');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.className = 'galerie-fenetre';
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'galerie-fermer';
        close.textContent = '×';
        close.addEventListener('click', function() { dialog.close(); });
        const image = document.createElement('img');
        dialog.append(close, image);
        // Un clic à côté de la photo ferme la fenêtre.
        dialog.addEventListener('click', function(event) {
            if (event.target === dialog) { dialog.close(); }
        });
        dialog.addEventListener('close', function() {
            if (dialog.origin) { dialog.origin.focus(); }
        });
        document.body.appendChild(dialog);
    }
    const image = dialog.querySelector('img');
    image.src = source;
    image.alt = alt;
    dialog.querySelector('.galerie-fermer').setAttribute('aria-label', closeLabel);
    dialog.origin = origin;
    dialog.showModal();
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

    addAttributionFields();
    initGalleries();
});
