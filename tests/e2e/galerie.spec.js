// Galerie de photos (_includes/galerie.html et main.js) : défilement de gauche
// à droite, flèches sur ordinateur, photo agrandie dans une fenêtre.
const { test, expect } = require('./outils');

const PAGES_GALERIE = [
    { chemin: '/dj-mariage-quebec/', ancre: 'galerie', fermer: 'Fermer' },
    { chemin: '/index-en.html', ancre: 'gallery', fermer: 'Close' }
];

for (const infos of PAGES_GALERIE) {
    test(`galerie ${infos.chemin} : défilement et photo agrandie`, async ({ page, erreurs }, testInfo) => {
        await page.goto(infos.chemin);
        const galerie = page.locator(`#${infos.ancre}`);
        const piste = galerie.locator('.galerie-piste');
        await piste.scrollIntoViewIfNeeded();

        // Plus de photos que la largeur de l'écran : la piste défile.
        const tailles = await piste.evaluate(function(e) { return { visible: e.clientWidth, total: e.scrollWidth }; });
        expect(tailles.total).toBeGreaterThan(tailles.visible);

        if (testInfo.project.name === 'chrome-ordi') {
            const precedent = galerie.locator('[data-galerie-precedent]');
            const suivant = galerie.locator('[data-galerie-suivant]');
            await expect(precedent).toBeDisabled();
            await suivant.click();
            await expect.poll(function() { return piste.evaluate(function(e) { return e.scrollLeft; }); }).toBeGreaterThan(0);
            await expect(precedent).toBeEnabled();
        } else {
            // Sur téléphone, on fait défiler au doigt : les flèches sont masquées.
            await expect(galerie.locator('[data-galerie-suivant]')).toBeHidden();
        }

        const premiere = galerie.locator('[data-galerie-photo]').first();
        const alt = await premiere.locator('img').getAttribute('alt');
        await premiere.click();
        const fenetre = page.locator('dialog.galerie-fenetre');
        await expect(fenetre).toBeVisible();
        const grande = fenetre.locator('img');
        await expect(grande).toHaveAttribute('alt', alt);
        await expect(grande).toHaveAttribute('src', /-1080\.webp$/);
        await expect.poll(function() { return grande.evaluate(function(e) { return e.naturalWidth; }); }).toBe(1080);

        await fenetre.getByRole('button', { name: infos.fermer }).click();
        await expect(fenetre).toBeHidden();
        await expect(premiere).toBeFocused();

        expect(erreurs, 'erreurs JavaScript ou console').toEqual([]);
    });
}
