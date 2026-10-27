// Tests e2e du site : npm run test:e2e
// Par défaut, teste le site compilé par Jekyll dans _site (servi en local).
// BASE_URL=https://djsteeveh.com npm run test:e2e teste le vrai site en ligne.
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL;
const ORDI = { width: 1366, height: 900 };

module.exports = defineConfig({
    testDir: 'tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: BASE_URL || 'http://127.0.0.1:4000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    // Un ordinateur et un iPhone (beaucoup de clients ouvrent le site sur iPhone).
    projects: [
        { name: 'chrome-ordi', use: { ...devices['Desktop Chrome'], viewport: ORDI } },
        // Densité 1 : sans carte graphique, la haute densité rend Safari trop lent.
        { name: 'safari-iphone', use: { ...devices['iPhone 15'], deviceScaleFactor: 1 } }
    ],
    webServer: BASE_URL ? undefined : {
        command: 'node tests/e2e/serveur.js',
        url: 'http://127.0.0.1:4000/',
        reuseExistingServer: !process.env.CI
    }
});
