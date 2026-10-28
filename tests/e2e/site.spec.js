// Les 5 vérifications essentielles, sur chacune des 8 pages du site.
// L'envoi vers Formspree et Google Analytics est intercepté : aucune vraie
// demande n'est envoyée et les statistiques ne sont pas faussées.
const { test, expect, FORMULAIRE, remplirFormulaire, envoyerFormulaire, defilerJusquEnBas } = require('./outils');
const { PAGES, DOMAINE, LIBELLES, PROVENANCES, TELEPHONE, FORMSPREE, GA4 } = require('./pages');

function attribut(page, selecteur, nom) {
    return page.locator(selecteur).getAttribute(nom);
}

for (const infos of PAGES) {
    test.describe(`${infos.nom} (${infos.chemin})`, function() {
        test('chargement : sans erreur, sans fichier manquant, images et scripts actifs', async ({ page, erreurs, externes }) => {
            const manquantes = [];
            page.on('response', function(reponse) {
                if (reponse.status() >= 400) { manquantes.push(`${reponse.status()} ${reponse.url()}`); }
            });
            page.on('requestfailed', function(requete) { manquantes.push(`échec ${requete.url()}`); });

            const reponse = await page.goto(infos.chemin);
            expect(reponse.status()).toBe(200);
            await defilerJusquEnBas(page);
            // Safari ne charge pas toujours une image paresseuse survolée trop vite :
            // on force le chargement de toutes les images pour vérifier qu'elles existent.
            await page.evaluate(function() {
                document.querySelectorAll('img[loading="lazy"]').forEach(function(image) { image.loading = 'eager'; });
            });
            await page.waitForFunction(function() {
                return Array.from(document.images).every(function(image) { return image.complete; });
            });

            const images = await page.locator('img').evaluateAll(function(elements) {
                return elements.map(function(image) {
                    return { src: image.currentSrc || image.src, chargee: image.naturalWidth > 0, alt: image.getAttribute('alt') };
                });
            });
            expect(images.length).toBeGreaterThan(0);
            for (const image of images) {
                expect(image.chargee, `image non chargée : ${image.src}`).toBe(true);
                expect(image.alt, `image sans alt : ${image.src}`).toBeTruthy();
            }

            const scripts = await page.evaluate(function(identifiant) {
                return {
                    aos: typeof window.AOS,
                    attribution: typeof window.addAttributionFields,
                    ga4: (window.dataLayer || []).filter(function(e) { return e[0] === 'config' && e[1] === identifiant; }).length
                };
            }, GA4);
            expect(scripts).toEqual({ aos: 'object', attribution: 'function', ga4: 1 });
            expect(externes.filter(function(url) { return url.includes(`gtag/js?id=${GA4}`); })).toHaveLength(1);

            expect(manquantes, 'fichiers en erreur').toEqual([]);
            expect(erreurs, 'erreurs JavaScript ou console').toEqual([]);
        });

        test('référencement Google : balises, canonical, partage, données structurées, hreflang', async ({ page, request }) => {
            await page.goto(infos.chemin);
            expect(await attribut(page, 'html', 'lang')).toBe(infos.lang);
            await expect(page).toHaveTitle(/DJ Steeve H\./);
            const description = await attribut(page, 'meta[name="description"]', 'content');
            expect(description.length).toBeGreaterThanOrEqual(50);
            await expect(page.locator('h1')).toHaveCount(1);
            expect(await attribut(page, 'meta[name="robots"]', 'content')).toBe('index, follow');
            expect(await attribut(page, 'link[rel="canonical"]', 'href')).toBe(DOMAINE + infos.chemin);

            expect(await attribut(page, 'meta[property="og:url"]', 'content')).toBe(DOMAINE + infos.chemin);
            expect(await attribut(page, 'meta[property="og:title"]', 'content')).toBeTruthy();
            expect(await attribut(page, 'meta[property="og:image"]', 'content')).toBe(DOMAINE + infos.ogImage);
            expect(await attribut(page, 'meta[name="twitter:image"]', 'content')).toBe(DOMAINE + infos.ogImage);
            expect((await request.get(infos.ogImage)).status(), `image de partage ${infos.ogImage}`).toBe(200);

            const types = [];
            for (const bloc of await page.locator('script[type="application/ld+json"]').allTextContents()) {
                const donnees = JSON.parse(bloc);
                for (const element of donnees['@graph'] || [donnees]) { types.push(element['@type']); }
            }
            expect(types).toEqual(infos.jsonLd);

            const hreflang = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(function(elements) {
                return Object.fromEntries(elements.map(function(lien) { return [lien.getAttribute('hreflang'), lien.getAttribute('href')]; }));
            });
            const attendus = Object.fromEntries(Object.entries(infos.hreflang || {}).map(function([langue, chemin]) {
                return [langue, DOMAINE + chemin];
            }));
            expect(hreflang).toEqual(attendus);
        });

        test('liens : pages internes, ancres, langues et téléphone', async ({ page, request }) => {
            await page.goto(infos.chemin);

            const internes = new Set();
            for (const lien of await page.locator('a[href]').evaluateAll(function(e) { return e.map(function(a) { return a.href; }); })) {
                const url = new URL(lien);
                if (url.origin === new URL(page.url()).origin || url.origin === DOMAINE) { internes.add(url.pathname); }
            }
            for (const chemin of internes) {
                expect((await request.get(chemin)).status(), `lien vers ${chemin}`).toBe(200);
            }

            const ancres = await page.locator('a[href^="#"]').evaluateAll(function(e) {
                return [...new Set(e.map(function(a) { return a.getAttribute('href'); }))];
            });
            for (const ancre of ancres) {
                await expect(page.locator(ancre), `cible de ${ancre}`).toHaveCount(1);
            }
            const sections = await page.locator('section[id]').evaluateAll(function(e) { return e.map(function(s) { return s.id; }); });
            expect(sections).toEqual(infos.sections);

            const langues = await page.locator('header a', { hasText: /^(FR|EN|ES)$/ }).evaluateAll(function(e) {
                return Object.fromEntries(e.map(function(a) { return [a.textContent.trim(), a.getAttribute('href')]; }));
            });
            expect(langues).toEqual(infos.langues || {
                FR: infos.famille === 'service' ? infos.chemin : '/',
                EN: '/index-en.html',
                ES: '/index-es.html'
            });

            const telephones = page.locator('a[href^="tel:"]');
            expect(await telephones.count()).toBeGreaterThan(0);
            for (const lien of await telephones.all()) {
                await expect(lien).toHaveAttribute('href', TELEPHONE.lien);
                await expect(lien).toContainText(TELEPHONE.texte);
            }
        });

        test('formulaire : champs attendus et envoi complet à Formspree', async ({ page, envois }) => {
            await page.goto(infos.chemin);
            const formulaire = page.locator(FORMULAIRE);
            await expect(formulaire).toHaveCount(1);
            await expect(formulaire).toHaveAttribute('action', FORMSPREE);

            const requis = await formulaire.locator('[required]').evaluateAll(function(e) { return e.map(function(c) { return c.name; }); });
            expect(requis).toEqual(infos.requis);
            await expect(formulaire.locator('button[type="submit"]')).toHaveText(infos.bouton);

            // Question de provenance : facultative, traduite, avec les 7 choix.
            const question = formulaire.locator('select[name="provenance"]');
            await expect(question).not.toHaveAttribute('required', /.*/);
            await expect(page.locator('label[for="provenance"]')).toHaveText(LIBELLES[infos.langue].provenance);
            const choix = await question.locator('option:not([disabled])').evaluateAll(function(e) { return e.map(function(o) { return o.value; }); });
            expect(choix).toEqual(PROVENANCES);

            const valeurs = await remplirFormulaire(page);
            await question.selectOption('recommandation');
            await envoyerFormulaire(page);
            expect(envois).toHaveLength(1);
            expect(envois[0].champs).toMatchObject({
                ...valeurs,
                provenance: 'recommandation',
                site_referent: '(direct)',
                page_arrivee: infos.chemin,
                page_formulaire: infos.chemin
            });
        });

        test('affichage : la page tient dans l\'écran et le formulaire est accessible', async ({ page }) => {
            await page.goto(infos.chemin);
            const largeurEcran = page.viewportSize().width;
            await defilerJusquEnBas(page);
            const largeurPage = await page.evaluate(function() { return document.documentElement.scrollWidth; });
            expect(largeurPage, 'débordement sur le côté').toBeLessThanOrEqual(largeurEcran);

            await page.evaluate(function() { window.scrollTo({ top: 0, behavior: 'instant' }); });
            const contact = infos.sections[infos.sections.length - 1];
            // force : voir envoyerFormulaire (Safari lent sans carte graphique).
            await page.locator(`header a[href="#${contact}"]`).filter({ visible: true }).first().click({ force: true });
            // Défilement animé (scroll-behavior: smooth) : long sur les pages avec FAQ dans Safari de CI.
            await expect(page.locator(`#${contact}`)).toBeInViewport({ timeout: 15000 });
            await expect(page.locator(`${FORMULAIRE} button[type="submit"]`)).toBeVisible();
        });
    });
}

test('sitemap : exactement les 8 pages, robots.txt, fichiers privés non publiés', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const adresses = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(function(m) { return m[1]; });
    expect([...adresses].sort()).toEqual(PAGES.map(function(infos) { return DOMAINE + infos.chemin; }).sort());

    expect(await (await request.get('/robots.txt')).text()).toContain(`Sitemap: ${DOMAINE}/sitemap.xml`);

    for (const chemin of ['/package.json', '/tailwind.config.js', '/playwright.config.js', '/src/tailwind.css', '/tests/e2e/pages.js']) {
        expect((await request.get(chemin)).status(), chemin).toBe(404);
    }
});
