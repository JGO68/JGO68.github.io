# Consignes pour les agents (Claude, Cursor, Copilot…)

Site statique publié par GitHub Pages, compilé avec Jekyll (aucun thème, aucune mise en page).

## Blocs communs : ne pas les recopier dans les pages

Les parties répétées du site existent à un seul endroit, dans `_includes/`.
Pour les modifier, modifier le bloc, pas les pages :

- `_data/entreprise.yml` : téléphone, villes desservies, coordonnées GPS, liens Facebook,
  Mixcloud et avis Google, liste des mixes. Ne jamais écrire ces informations en dur
  dans une page : utiliser `{{ site.data.entreprise.… }}`.
- `_includes/analytics.html` : balise Google Analytics.
- `_includes/service/` : blocs des pages services (`dj-*-quebec/`, `wedding-dj-quebec-city/`) : `entete.html`,
  `pied.html`, `mixes.html`, `avis.html`, `zone.html`, `contact.html` (haut de la
  section Contact), `boutons.html` (boutons du haut de page) et `fiche.html` (fiche
  Google JSON-LD ; textes propres à la page dans son front matter, `fiche.*`).
  Textes FR / EN de ces blocs dans `_data/service.yml` ; la langue vient de `langue: en`
  dans le front matter de la page (sans `langue` : français).
- Pages services traduites : `langues: { fr: …, en: … }` dans le front matter des deux
  pages de la paire. Les liens FR / EN de l'en-tête suivent cette paire, et
  `{% include service/hreflang.html %}` (dans le `<head>` des deux pages) ajoute les
  balises hreflang.
- `_data/services.yml` : liste des pages services (liens du pied de page ; `libelle_en`
  pour les pages anglaises).
- `_includes/formulaire.html` : formulaire de soumission des 8 pages ; textes FR / EN / ES
  dans `_data/formulaire.yml`, particularités de chaque page dans les paramètres de l'include.
- `_includes/accueil/` : blocs des 3 accueils : `entete.html`, `pied.html`, `mixes.html`,
  `avis.html`, `contact.html` et `fiche.html`
  (fiche Google JSON-LD) ; textes FR / EN / ES dans `_data/accueil.yml`.
- `_includes/avis.html` : cartes d'avis clients des 8 pages ; textes FR / EN / ES dans `_data/avis.yml`,
  avis affichés (et leur ordre) choisis par chaque page dans le paramètre `liste`.
- `_includes/galerie.html` : galerie de photos défilante des 8 pages (12 photos, après « Mes Services »
  sur les accueils, après « Sur mesure » sur les pages services). Photos et textes FR / EN / ES
  dans `_data/galerie.yml`, fichiers dans `galerie/` (webp 400, 800 et 1080 px, recadrés en 3:4,
  sans métadonnées, sans visage reconnaissable d'invité). Flèches et photo agrandie : `main.js`.
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
