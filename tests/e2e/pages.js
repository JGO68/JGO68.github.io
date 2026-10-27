// Description des 7 pages du site : la source de vérité des tests e2e.
// Ajouter une page ici suffit pour qu'elle soit couverte par toute la suite.

const DOMAINE = 'https://djsteeveh.com';

const LIBELLES = {
    fr: { provenance: 'Comment m’avez-vous trouvé ?', choix: 'Sélectionnez une option' },
    en: { provenance: 'How did you find me?', choix: 'Select an option' },
    es: { provenance: '¿Cómo me encontró?', choix: 'Seleccione una opción' }
};

// Valeurs de la question « Comment m'avez-vous trouvé ? », identiques dans toutes les langues.
const PROVENANCES = [
    'recherche-google',
    'google-maps',
    'facebook-instagram',
    'recommandation',
    'evenement',
    'ia',
    'autre'
];

const ACCUEIL_COMMUN = {
    famille: 'accueil',
    jsonLd: ['LocalBusiness'],
    ogImage: '/photo.png',
    hreflang: {
        'fr-CA': '/',
        'en-CA': '/index-en.html',
        es: '/index-es.html',
        'x-default': '/'
    }
};

const SERVICE_COMMUN = {
    famille: 'service',
    langue: 'fr',
    lang: 'fr-CA',
    jsonLd: ['WebPage', 'WebSite', 'LocalBusiness'],
    hreflang: null
};

const PAGES = [
    {
        ...ACCUEIL_COMMUN,
        nom: 'accueil-fr',
        chemin: '/',
        langue: 'fr',
        lang: 'fr-CA',
        sections: ['accueil', 'services', 'avis', 'mixes', 'contact'],
        requis: ['nom', 'email', 'date_evenement', 'lieu', 'message'],
        bouton: 'Envoyer'
    },
    {
        ...ACCUEIL_COMMUN,
        nom: 'accueil-en',
        chemin: '/index-en.html',
        langue: 'en',
        lang: 'en-CA',
        sections: ['home', 'services', 'reviews', 'mixes', 'contact'],
        requis: ['name', 'email', 'date_evenement', 'lieu', 'message'],
        bouton: 'Send'
    },
    {
        ...ACCUEIL_COMMUN,
        nom: 'accueil-es',
        chemin: '/index-es.html',
        langue: 'es',
        lang: 'es',
        sections: ['inicio', 'servicios', 'opiniones', 'mixes', 'contacto'],
        requis: ['nombre', 'email', 'date_evenement', 'lieu', 'mensaje'],
        bouton: 'Enviar'
    },
    {
        ...SERVICE_COMMUN,
        nom: 'mariage',
        chemin: '/dj-mariage-quebec/',
        ogImage: '/mariage.jpg',
        sections: ['accueil', 'sur-mesure', 'moments', 'musique', 'avis', 'mixes', 'zone', 'contact'],
        requis: ['nom', 'email', 'date_mariage', 'lieu', 'message'],
        bouton: 'Demander une soumission pour mon mariage'
    },
    {
        ...SERVICE_COMMUN,
        nom: 'noel',
        chemin: '/dj-party-noel-quebec/',
        ogImage: '/corporatif.jpg',
        jsonLd: ['WebPage', 'WebSite', 'LocalBusiness', 'FAQPage'],
        sections: ['accueil', 'sur-mesure', 'moments', 'musique', 'corporatif', 'avis', 'mixes', 'zone', 'faq', 'contact'],
        requis: ['nom', 'email', 'entreprise', 'date_evenement', 'lieu', 'message'],
        bouton: 'Demander une soumission pour notre party de Noël'
    },
    {
        ...SERVICE_COMMUN,
        nom: 'anniversaire',
        chemin: '/dj-anniversaire-quebec/',
        ogImage: '/soiree.jpg',
        sections: ['accueil', 'sur-mesure', 'moments', 'musique', 'avis', 'mixes', 'zone', 'contact'],
        requis: ['nom', 'email', 'date_evenement', 'lieu', 'message'],
        bouton: 'Demander une soumission pour mon anniversaire'
    },
    {
        ...SERVICE_COMMUN,
        nom: 'corporatif',
        chemin: '/dj-corporatif-quebec/',
        ogImage: '/corporatif.jpg',
        sections: ['accueil', 'sur-mesure', 'moments', 'musique', 'party-noel', 'avis', 'mixes', 'zone', 'contact'],
        requis: ['nom', 'email', 'entreprise', 'type_evenement', 'date_evenement', 'lieu', 'message'],
        bouton: 'Demander une soumission pour notre événement'
    }
];

const TELEPHONE = { lien: 'tel:+14184313229', texte: '(418) 431-3229' };
const FORMSPREE = 'https://formspree.io/f/mgvevgdp';
const GA4 = 'G-191XV8D4B1';

module.exports = { DOMAINE, LIBELLES, PROVENANCES, PAGES, TELEPHONE, FORMSPREE, GA4 };
