# marvin-ribard.fr — migration WordPress → Astro

Refonte du site de **Marvin Ribard Couverture** (artisan couvreur, Sud de l'Essonne et
Nord du Loiret), aujourd'hui sous WordPress + page builder Breakdance.

---

## ⚠️ La contrainte à ne jamais oublier

**Les 33 URLs du site WordPress sont conservées au caractère près, slash final compris.**

C'est garanti par deux options d'`astro.config.mjs` :

```js
trailingSlash: 'always',
build: { format: 'directory' },
```

Sans elles, `/contact/` devient `/contact` et les 33 URLs indexées tombent en 404.
Ne pas y toucher sans reconstruire tout un plan de redirection.

Trois URLs sont volontairement « bancales » et le restent : les services Loiret sont
sous `/couvreur-45/`, **sauf** `/nettoyage-et-demoussage-de-toiture-dans-le-loiret-45/`
et `/pose-et-remplacement-de-velux-dans-le-loiret-45/` qui sont à la racine. C'est
l'existant, on le préserve et on compense par le maillage et le fil d'Ariane.

---

## Démarrer

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
npm run preview
```

Le build utilise l'adaptateur **Node standalone** (`@astrojs/node`), nécessaire pour la
route `POST /api/devis` qui traite le formulaire de contact. Le reste du site est
prérendu en statique.

```bash
node ./dist/server/entry.mjs
```

Variables d'environnement : voir `.env.example` (SMTP du formulaire de devis).

---

## Structure

```
src/
├── data/                 ← les 4 sources de vérité, à éditer en priorité
│   ├── entreprise.json     NAP, SIRET, horaires, zone, assurance
│   ├── services.json       8 services × URL 91 + URL 45
│   ├── villes.json         9 communes 91 + Méréville
│   └── reviews.json        18 avis Google, dates absolues
├── layouts/BaseLayout.astro   head SEO + JSON-LD RoofingContractor global
├── lib/
│   ├── schemas.ts          fabriques JSON-LD (breadcrumb, service, faq, avis)
│   └── antispam.ts         protection du formulaire
├── components/
├── styles/global.css       design system, palette extraite du logo
└── pages/                  les 33 URLs (voir mapping ci-dessous)
```

### Les quatre fichiers de données

Toute mention du téléphone, de l'adresse, des horaires ou du SIRET dans une page doit
venir de `entreprise.json`. Ne jamais réécrire ces valeurs en dur : le site WordPress
affichait **trois versions différentes des horaires** et **deux SIRET différents** parce
qu'ils étaient saisis page par page.

---

## Mapping des 33 URLs conservées

### Transverses
| URL | Fichier |
|---|---|
| `/` | `pages/index.astro` ✅ |
| `/a-propos/` | `pages/a-propos.astro` |
| `/contact/` | `pages/contact.astro` |
| `/mentions-legales/` | `pages/mentions-legales.astro` |
| `/plan-du-site/` | `pages/plan-du-site.astro` |
| `/mes-services-de-couvreur-dans-le-loiret/` | page **vide** sur WP — à rédiger ou rediriger vers `/couvreur-45/` |

### Services Essonne (91)
| URL | Fichier |
|---|---|
| `/renovation-de-toiture-91/` | `pages/renovation-de-toiture-91.astro` |
| `/reparation-de-toiture-dans-lessonne-91/` | `pages/reparation-de-toiture-dans-lessonne-91.astro` |
| `/nettoyage-et-demoussage-de-toiture/` | `pages/nettoyage-et-demoussage-de-toiture.astro` |
| `/isolation-de-toiture/` | `pages/isolation-de-toiture.astro` |
| `/travaux-de-zinguerie/` | `pages/travaux-de-zinguerie.astro` |
| `/pose-et-remplacement-de-gouttiere-dans-lessonne-91/` | idem en `.astro` |
| `/pose-et-remplacement-de-velux-dans-l-essonne-91/` | idem en `.astro` |
| `/toiture-en-bac-acier-dans-lessonne-91/` | idem en `.astro` |

### Services Loiret (45)
| URL | Fichier |
|---|---|
| `/couvreur-45/` | `pages/couvreur-45/index.astro` |
| `/couvreur-45/renovation-de-toiture-dans-le-loiret/` | `pages/couvreur-45/…astro` |
| `/couvreur-45/reparation-de-toiture-dans-le-loiret-45/` | idem |
| `/couvreur-45/isolation-de-toiture-dans-le-loiret/` | idem |
| `/couvreur-45/travaux-de-zinguerie-dans-le-loiret/` | idem |
| `/couvreur-45/pose-de-gouttieres-dans-le-loiret/` | idem |
| `/couvreur-45/toitures-bac-acier-dans-le-loiret-45/` | idem |
| `/nettoyage-et-demoussage-de-toiture-dans-le-loiret-45/` | **à la racine** |
| `/pose-et-remplacement-de-velux-dans-le-loiret-45/` | **à la racine** |

### Villes
Les 9 communes de l'Essonne suivent le motif `couvreur-a-{slug}-{cp}` et seront générées
par une route dynamique alimentée par `villes.json`. Malesherbes reste une page fixe
parce qu'elle vit dans `/couvreur-45/`.

`/couvreur-a-saint-cheron-91530/` · `/couvreur-a-cerny-91590/` · `/couvreur-a-dourdan-91410/` ·
`/couvreur-a-abbeville-la-riviere-91150/` · `/couvreur-a-milly-la-foret-91490/` ·
`/couvreur-a-la-ferte-alais-91590/` · `/couvreur-a-etampes-91150/` ·
`/couvreur-a-chamarande-91730/` · `/couvreur-a-etrechy-91580/` ·
`/couvreur-45/couvreur-a-malesherbes-45330/`

### Pages nouvelles (sans impact sur l'existant)
`/couvreur-a-mereville-91660/` · `/avis-clients/` · `/realisations/` ·
`/politique-de-confidentialite/`

---

## Règles éditoriales issues de l'audit

**Ne jamais adapter une page Loiret depuis sa jumelle Essonne.** C'est exactement ce qui
a produit l'état actuel : 90 à 97 % de duplication entre les 8 paires de pages service.
Chaque page 45 se rédige indépendamment, avec son propre angle : matériaux du Gâtinais
et du Pithiverais, communes du Nord-Loiret citées nommément, chantiers réalisés là-bas.

**Ancrer localement le corps de texte.** Sur le site WordPress, le mot « Essonne »
apparaissait *zéro fois* dans le corps des pages réparation et bac acier. Chaque page
service doit citer des communes réelles de sa zone.

**3 à 5 liens contextuels par page**, vers les services connexes (`connexes` dans
`services.json`) et vers les villes de la zone. Le site WordPress n'en avait que deux
sur huit pages de service, dont un avec une ancre mensongère.

**Un seul H1 par page**, hiérarchie H1 → H2 → H3 respectée. Sur WP : deux H1 sur
l'accueil et sur `/couvreur-45/`, et des H4 placés avant le premier H2 sur les pages
villes.

**Pas d'initiales dans un cercle** sur les cards d'avis (consigne client) : nom, date,
étoiles et logo Google.

---

## À compléter avant mise en ligne

Ces valeurs sont vides dans `src/data/entreprise.json` et bloquent la mise en ligne :

- **Assurance décennale** — assureur et n° de police, en attente de l'attestation de
  M. Ribard. Obligation légale (art. L.243-2 du Code des assurances), totalement absente
  du site WordPress. Tant que les champs sont vides, **aucune** mention d'assurance
  n'apparaît sur le site : ne jamais écrire « garantie décennale » en dur dans une page
  avant d'avoir l'attestation.
- **Année de création** et **certifications** (CAP, BP, RGE, Qualibat) — le plus gros
  trou d'autorité de la page À propos.
- **Horaires définitifs** — trois versions contradictoires cohabitaient sur WP.
- **Identifiant GA4** dans `src/components/CookieBanner.astro` si une mesure d'audience
  est souhaitée. Tant qu'il est vide, aucun script tiers n'est chargé.

Renseigné : fiche **Google Business Profile** (`https://maps.app.goo.gl/ey2fLkSGiJQVQK1C6`),
utilisée en `sameAs` et `hasMap` sur l'entité principale.

### ⛔ Pas de balisage d'avis, volontairement

Google exclut les avis auto-déclarés sur son propre site (« self-serving reviews ») des
rich results `LocalBusiness` et `Organization`. Un `AggregateRating` ou des `Review` pour
sa propre entreprise n'affichent aucune étoile en SERP et exposent à une action manuelle.

Les 18 avis sont donc **affichés en contenu visible uniquement** (composant
`AvisCarrousel` + page `/avis-clients/`), sans JSON-LD. Les étoiles se gagnent sur la
fiche Google Business Profile, pas dans le code du site. Ne pas réintroduire de fonction
`avisClients()` dans `src/lib/schemas.ts`.

Corrections déjà appliquées dans les données : SIRET (`484343098400024`, 15 chiffres et
invalide sur WP → `843 430 984 00024`), forme juridique unifiée en « Entreprise
Individuelle », horaires et périmètre d'intervention ramenés à une version unique.

---

## Recette avant bascule DNS

1. Les 33 URLs répondent en 200 sur la préproduction, slash final compris.
2. Une seule balise `<title>`, une seule `<h1>`, une canonique auto-référente par page.
3. Données structurées validées (Rich Results Test) : `RoofingContractor` unique,
   `BreadcrumbList` sur chaque page, `Service` sur les pages service.
4. Lighthouse mobile ≥ 90 sur les quatre axes.
5. `.htaccess` en place (HTTPS, www → non-www, cache, en-têtes de sécurité).
6. Après bascule : soumettre `sitemap-index.xml` dans Search Console, demander
   l'exploration des pages principales, surveiller les positions 3 à 4 semaines.
