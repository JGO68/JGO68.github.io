// Petit serveur statique pour les tests : sert le site compilé par Jekyll
// (_site par défaut) en imitant GitHub Pages (index.html des dossiers,
// redirection 301 vers la barre oblique finale, vraie réponse 404).
const http = require('http');
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(process.env.SITE_DIR || '_site');
const PORT = Number(process.env.PORT || 4000);

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
};

if (!fs.existsSync(path.join(RACINE, 'index.html'))) {
    console.error(`Site compilé introuvable dans ${RACINE}. Compiler d'abord avec Jekyll.`);
    process.exit(1);
}

http.createServer(function(requete, reponse) {
    const url = new URL(requete.url, 'http://localhost');
    let chemin = path.join(RACINE, decodeURIComponent(url.pathname));
    if (!chemin.startsWith(RACINE)) {
        reponse.writeHead(403).end();
        return;
    }

    if (fs.existsSync(chemin) && fs.statSync(chemin).isDirectory()) {
        if (!url.pathname.endsWith('/')) {
            reponse.writeHead(301, { Location: url.pathname + '/' + url.search }).end();
            return;
        }
        chemin = path.join(chemin, 'index.html');
    }

    fs.readFile(chemin, function(erreur, contenu) {
        if (erreur) {
            reponse.writeHead(404, { 'Content-Type': 'text/plain' }).end('404');
            return;
        }
        const type = TYPES[path.extname(chemin)] || 'application/octet-stream';
        reponse.writeHead(200, { 'Content-Type': type }).end(contenu);
    });
}).listen(PORT, '127.0.0.1', function() {
    console.log(`Site servi depuis ${RACINE} sur http://127.0.0.1:${PORT}`);
});
