// Outils communs aux tests e2e.
// Toute requête qui sort du site est interceptée : Formspree (aucune vraie
// demande n'est envoyée), Google Analytics (les statistiques ne sont pas
// faussées), Mixcloud, Google Maps... Les tests ne dépendent donc d'aucun
// service externe.
const base = require('@playwright/test');
const { FORMSPREE } = require('./pages');

const FORMULAIRE = 'form[data-preserve-query]';

function typeDeContenu(ressource) {
    if (ressource === 'script') { return 'text/javascript'; }
    if (ressource === 'stylesheet') { return 'text/css'; }
    if (ressource === 'document') { return 'text/html'; }
    return 'text/plain';
}

const test = base.test.extend({
    // Requêtes externes demandées par la page (adresse complète).
    externes: async ({}, use) => { await use([]); },

    // Envois du formulaire reçus par le faux Formspree : { url, champs }.
    envois: async ({}, use) => { await use([]); },

    // Erreurs JavaScript et erreurs de console de la page.
    erreurs: async ({}, use) => { await use([]); },

    context: async ({ context, baseURL, externes, envois }, use) => {
        const origineSite = new URL(baseURL).origin;
        await context.route('**/*', async function(route) {
            const requete = route.request();
            const url = requete.url();
            if (new URL(url).origin === origineSite) {
                await route.continue();
                return;
            }
            if (url.startsWith(FORMSPREE)) {
                envois.push({
                    url: url,
                    champs: Object.fromEntries(new URLSearchParams(requete.postData() || ''))
                });
                await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Merci</p>' });
                return;
            }
            externes.push(url);
            await route.fulfill({ status: 200, contentType: typeDeContenu(requete.resourceType()), body: '' });
        });
        await use(context);
    },

    page: async ({ page, erreurs }, use) => {
        page.on('pageerror', function(erreur) { erreurs.push(`JS : ${erreur.message}`); });
        page.on('console', function(message) {
            if (message.type() === 'error') { erreurs.push(`console : ${message.text()}`); }
        });
        await use(page);
    }
});

// Remplit tous les champs obligatoires du formulaire avec des valeurs valides
// et renvoie les valeurs saisies, par nom de champ.
async function remplirFormulaire(page) {
    const valeurs = {};
    const champs = page.locator(`${FORMULAIRE} [required]`);
    for (const champ of await champs.all()) {
        const nom = await champ.getAttribute('name');
        const balise = await champ.evaluate(function(element) { return element.tagName; });
        const type = await champ.getAttribute('type');
        if (balise === 'SELECT') {
            const options = await champ.locator('option:not([disabled])').all();
            const valeur = (await options[0].getAttribute('value')) || (await options[0].innerText());
            await champ.selectOption(valeur);
            valeurs[nom] = valeur;
        } else if (type === 'email') {
            valeurs[nom] = 'test@example.com';
            await champ.fill(valeurs[nom]);
        } else if (type === 'date') {
            valeurs[nom] = '2026-12-12';
            await champ.fill(valeurs[nom]);
        } else if (type === 'tel') {
            valeurs[nom] = '4185550000';
            await champ.fill(valeurs[nom]);
        } else {
            valeurs[nom] = `Test e2e ${nom}`;
            await champ.fill(valeurs[nom]);
        }
    }
    return valeurs;
}

// Clique sur le bouton d'envoi et attend la réponse du faux Formspree (demande enregistrée).
async function envoyerFormulaire(page) {
    const bouton = page.locator(`${FORMULAIRE} button[type="submit"]`);
    // Sur iPhone, Safari fait défiler la page vers le dernier champ rempli avec
    // un temps de retard, ce qui contrarie le défilement automatique du test :
    // on libère le champ et on amène le bouton à l'écran avant de cliquer.
    // Sans carte graphique (conteneur de test), Safari dessine certaines pages
    // très lentement : le clic n'attend pas que l'image soit « stable ».
    await page.evaluate(function() { document.activeElement.blur(); });
    await bouton.evaluate(function(element) { element.scrollIntoView({ block: 'center', behavior: 'instant' }); });
    await base.expect(bouton).toBeInViewport();
    await Promise.all([
        page.waitForResponse(function(reponse) { return reponse.url().startsWith(FORMSPREE); }),
        bouton.click({ force: true })
    ]);
}

// Fait défiler toute la page pour déclencher les images paresseuses et les animations AOS.
async function defilerJusquEnBas(page) {
    await page.evaluate(async function() {
        const attendre = function(ms) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); };
        const pas = Math.max(200, Math.floor(window.innerHeight / 2));
        for (let y = 0; y <= document.documentElement.scrollHeight; y += pas) {
            window.scrollTo(0, y);
            await attendre(120);
        }
        window.scrollTo(0, document.documentElement.scrollHeight);
        await attendre(200);
    });
}

// Champs cachés ajoutés au formulaire par main.js (nom → valeur).
async function champsCaches(page) {
    return page.locator(`${FORMULAIRE} input[type="hidden"]`).evaluateAll(function(champs) {
        return Object.fromEntries(champs.map(function(champ) { return [champ.name, champ.value]; }));
    });
}

module.exports = {
    test,
    expect: base.expect,
    FORMULAIRE,
    remplirFormulaire,
    envoyerFormulaire,
    defilerJusquEnBas,
    champsCaches
};
