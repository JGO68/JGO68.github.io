# Consignes pour les agents (Claude, Cursor, Copilot…)

Site statique publié par GitHub Pages, compilé avec Jekyll (aucun thème, aucune mise en page).

## Blocs communs : ne pas les recopier dans les pages

Les parties répétées du site existent à un seul endroit, dans `_includes/`.
Pour les modifier, modifier le bloc, pas les pages :

- `_data/entreprise.yml` : téléphone, villes desservies, coordonnées GPS, liens Facebook,
  Mixcloud et avis Google, liste des mixes. Ne jamais écrire ces informations en dur
  dans une page : utiliser `{{ site.data.entreprise.… }}`.
- `_includes/analytics.html` : balise Google Analytics.
- `_includes/service/` : blocs des pages services (`dj-*-quebec/`) : `entete.html`,
  `pied.html`, `mixes.html`, `avis.html`, `zone.html`, `contact.html` (haut de la
  section Contact), `boutons.html` (boutons du haut de page) et `fiche.html` (fiche
  Google JSON-LD ; textes propres à la page dans son front matter, `fiche.*`).
- `_data/services.yml` : liste des pages services (liens du pied de page).
- `_includes/formulaire.html` : formulaire de soumission des 7 pages ; textes FR / EN / ES
  dans `_data/formulaire.yml`, particularités de chaque page dans les paramètres de l'include.
- `_includes/accueil/` : blocs des 3 accueils : `entete.html`, `pied.html`, `mixes.html`,
  `avis.html`, `contact.html` et `fiche.html`
  (fiche Google JSON-LD) ; textes FR / EN / ES dans `_data/accueil.yml`.
- `_includes/avis.html` : cartes d'avis clients des 7 pages ; textes FR / EN / ES dans `_data/avis.yml`,
  avis affichés (et leur ordre) choisis par chaque page dans le paramètre `liste`.
- FAQ des pages services : questions et réponses dans le front matter de la page
  (`faq.titre`, `faq.questions`), affichées par `_includes/service/faq.html` et ajoutées
  à la fiche Google par `fiche.html`. Écrire `[villes]` dans une réponse pour la liste
  des villes desservies.
- Section « zone desservie » des pages services : paragraphe propre à chaque page
  dans son front matter (`zone.texte`).

Les pages qui utilisent ces blocs commencent par un en-tête `---` (front matter).
Garder `layout: null` : sans lui, GitHub Pages ajouterait une mise en page par défaut.

## Après une modification

1. Classes Tailwind ajoutées ou retirées : `npm run build:css`, puis commiter `tailwind.css`.
2. Tests e2e : `npm run test:e2e` (voir `playwright.config.js`). Le site doit d'abord
   être compilé par Jekyll dans `_site`. Les tests tournent aussi dans GitHub Actions
   à chaque pull request.
3. Les adresses des pages ne doivent pas changer (référencement Google).
