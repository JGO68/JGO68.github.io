# Consignes pour les agents (Claude, Cursor, Copilot…)

Site statique publié par GitHub Pages, compilé avec Jekyll (aucun thème, aucune mise en page).

## Blocs communs : ne pas les recopier dans les pages

Les parties répétées du site existent à un seul endroit, dans `_includes/`.
Pour les modifier, modifier le bloc, pas les pages :

- `_includes/analytics.html` : balise Google Analytics.
- `_includes/service/entete.html`, `pied.html`, `mixes.html` : en-tête, pied de page
  et section Mixes des pages services (`dj-*-quebec/`).
- `_data/services.yml` : liste des pages services (liens du pied de page).
- `_includes/formulaire.html` : formulaire de soumission des 7 pages ; textes FR / EN / ES
  dans `_data/formulaire.yml`, particularités de chaque page dans les paramètres de l'include.
- `_includes/accueil/entete.html`, `pied.html`, `mixes.html` : en-tête, pied de page et
  section Mixes des 3 accueils ; textes dans `_data/accueil.yml`.
- `_includes/avis.html` : avis clients des 7 pages ; textes FR / EN / ES dans `_data/avis.yml`,
  avis affichés (et leur ordre) choisis par chaque page dans le paramètre `liste`.
- `_includes/service/zone.html` : section « zone desservie » des pages services ;
  paragraphe propre à chaque page dans son front matter (`zone.texte`).

Les pages qui utilisent ces blocs commencent par un en-tête `---` (front matter).
Garder `layout: null` : sans lui, GitHub Pages ajouterait une mise en page par défaut.

## Après une modification

1. Classes Tailwind ajoutées ou retirées : `npm run build:css`, puis commiter `tailwind.css`.
2. Tests e2e : `npm run test:e2e` (voir `playwright.config.js`). Le site doit d'abord
   être compilé par Jekyll dans `_site`. Les tests tournent aussi dans GitHub Actions
   à chaque pull request.
3. Les adresses des pages ne doivent pas changer (référencement Google).
