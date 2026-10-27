// Suivi de provenance (main.js) : d'où vient le visiteur, conservé entre les
// pages et les visites, ajouté au formulaire en champs cachés.
const { test, expect, FORMULAIRE, champsCaches, remplirFormulaire, envoyerFormulaire } = require('./outils');

const NOEL = '/dj-party-noel-quebec/';
const MARIAGE = '/dj-mariage-quebec/';
const GOOGLE = 'https://www.google.com/';
const CAMPAGNE = '?gclid=TEST123&utm_source=google&utm_medium=cpc&utm_campaign=noel';
const CHAMPS_PERMIS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'gbraid', 'wbraid', 'fbclid',
    'site_referent', 'page_arrivee', 'page_formulaire'
];

test('clic sur une annonce : la provenance suit le visiteur de page en page', async ({ page, context }) => {
    await page.goto(NOEL + CAMPAGNE, { referer: GOOGLE });
    expect(await champsCaches(page)).toEqual({
        gclid: 'TEST123',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'noel',
        site_referent: 'www.google.com',
        page_arrivee: NOEL,
        page_formulaire: NOEL
    });

    // Navigation interne en cliquant sur un vrai lien du site.
    await page.locator(`footer a[href="${MARIAGE}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${MARIAGE}$`));
    expect(await champsCaches(page)).toMatchObject({
        gclid: 'TEST123', site_referent: 'www.google.com', page_arrivee: NOEL, page_formulaire: MARIAGE
    });

    // Retour plus tard, en tapant l'adresse (visite directe).
    const retour = await context.newPage();
    await retour.goto('/index-en.html');
    expect(await champsCaches(retour)).toMatchObject({
        gclid: 'TEST123', utm_campaign: 'noel', page_arrivee: NOEL, page_formulaire: '/index-en.html'
    });
});

test('demande envoyée depuis une autre page : Formspree reçoit l\'origine de l\'annonce', async ({ page, envois }) => {
    await page.goto(NOEL + CAMPAGNE, { referer: GOOGLE });
    await page.goto(MARIAGE);
    await remplirFormulaire(page);
    await page.locator(`${FORMULAIRE} select[name="provenance"]`).selectOption('recherche-google');
    await envoyerFormulaire(page);
    expect(envois[0].champs).toMatchObject({
        provenance: 'recherche-google',
        gclid: 'TEST123',
        utm_source: 'google',
        utm_campaign: 'noel',
        site_referent: 'www.google.com',
        page_arrivee: NOEL,
        page_formulaire: MARIAGE
    });
});

test('une nouvelle source externe (Facebook) remplace l\'ancienne', async ({ page }) => {
    await page.goto(NOEL + CAMPAGNE, { referer: GOOGLE });
    await page.goto('/dj-anniversaire-quebec/', { referer: 'https://l.facebook.com/' });
    expect(await champsCaches(page)).toEqual({
        site_referent: 'l.facebook.com',
        page_arrivee: '/dj-anniversaire-quebec/',
        page_formulaire: '/dj-anniversaire-quebec/'
    });
});

test('sécurité : seuls les paramètres de campagne autorisés deviennent des champs', async ({ page }) => {
    const pieges = '?_next=https://evil.example&_cc=pirate@example.com&_subject=spam&_replyto=x@example.com'
        + '&email=pirate@example.com&message=spam&provenance=autre&gclid=OK';
    await page.goto(NOEL + pieges, { referer: GOOGLE });
    const champs = await champsCaches(page);
    expect(champs.gclid).toBe('OK');
    for (const nom of Object.keys(champs)) {
        expect(CHAMPS_PERMIS, `champ caché inattendu : ${nom}`).toContain(nom);
    }
    // Les champs visibles ne sont ni dupliqués ni modifiés.
    await expect(page.locator(`${FORMULAIRE} [name="email"]`)).toHaveCount(1);
    await expect(page.locator(`${FORMULAIRE} [name="email"]`)).toHaveValue('');
    await expect(page.locator(`${FORMULAIRE} [name="provenance"]`)).toHaveValue('');
});
