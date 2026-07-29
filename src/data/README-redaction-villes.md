# Rédaction des pages villes — règles et pools de rotation

Brief client du 29 juillet 2026. Ces règles s'appliquent aux **11 pages villes**
et à toute nouvelle commune ouverte ensuite.

---

## Règles transverses (tout le site)

1. **Aucun eyebrow.** Pas de sur-titre, pas de kicker, pas de petite ligne grise
   au-dessus d'un grand titre. Un bloc = un titre. Le motif `.entete-section`
   a été nettoyé dans ce sens, ne pas le rétablir.
2. **« dans l'Essonne »**, jamais « en Essonne ». Idem « dans le Loiret ».
3. Première personne (« je ») : artisan seul, aucun salarié.
4. Pas de superlatif invérifiable, pas d'emoji, pas de « satisfaction garantie ».

## Structure figée d'une page ville

1. Fil d'Ariane
2. Hero — H1 + paragraphe d'introduction bref + 3 puces + boutons + photo
3. Bandeau de réassurance
4. Bloc adresse + plan OpenStreetMap
5. H2 avis + **4 avis**, différents d'une ville à l'autre
6. Cards services avec lien vers la page service
7. CTA avec la photo portrait
8. Communes voisines

**Ne PAS mettre sur ces pages :** FAQ · architecture locale / patrimoine / ABF ·
climat local. Le client les a explicitement écartés.

---

## Le trio H1 / title / meta

Même intention de recherche (locale-commerciale : « couvreur + ville »), mais
**trois formulations différentes**, et le trio change d'une ville à l'autre.

- Le H1 n'est jamais recopié dans le title.
- La meta ne paraphrase pas le title : elle complète.
- On ne remplace pas le mot-clé par une simple prestation. « Couvreur »,
  « artisan couvreur », « couvreur zingueur », « entreprise de couverture »,
  « professionnel de la toiture » restent la tête de gondole.

### Pool H1 (une variante par ville, ne pas réutiliser deux fois de suite)

| # | Modèle |
|---|---|
| A | Couvreur à [Ville] — Marvin Ribard, votre artisan |
| B | Entreprise de couverture à [Ville] — Marvin Ribard |
| C | Votre couvreur zingueur à [Ville] |
| D | Marvin Ribard, artisan couvreur à [Ville] |
| E | Travaux de couverture à [Ville] — Marvin Ribard |
| F | Votre artisan couvreur à [Ville] |
| G | Couvreur et zingueur à [Ville] — Marvin Ribard |

### Pool title (50-60 caractères, mot-clé dans les 30 premiers)

| # | Modèle |
|---|---|
| A | Artisan couvreur à [Ville] ([CP]) — Devis gratuit |
| B | Couvreur à [Ville] ([CP]) — Marvin Ribard |
| C | Couvreur zingueur à [Ville] — Devis gratuit |
| D | Couvreur à [Ville] — Entretien et rénovation de toit |
| E | Professionnel de la toiture à [Ville] ([CP]) |

### Pool meta description (140-158 caractères, promesse dans les 110 premiers)

Doit contenir : une désignation de l'entreprise + la ville + une réassurance
(devis gratuit / sans engagement / déplacement offert) + le téléphone **ou** un
verbe d'action. Ne jamais reprendre la formule du title.

| # | Modèle |
|---|---|
| A | Entreprise de couverture à [Ville] : entretien, réparation et rénovation de votre toit. Devis gratuit et sans engagement, appelez le 06 22 62 09 86. |
| B | Votre professionnel de la toiture à [Ville] pour tous vos travaux de couverture et de zinguerie. Déplacement offert, devis gratuit au 06 22 62 09 86. |
| C | Fuite, tuiles cassées ou toit à démousser à [Ville] ? Artisan couvreur installé dans le Sud de l'Essonne, je me déplace et j'établis un devis gratuit. |
| D | Couverture, zinguerie et entretien de toiture à [Ville] par un artisan seul sur ses chantiers. 15 ans d'expérience, devis gratuit sans engagement. |

---

## Mots et tournures interdits sur ces pages

- **« atelier »** — banni le 29/07/2026. L'entreprise n'a pas d'atelier ouvert au
  public : on dit « siège de l'entreprise », ou rien du tout.
- Tout eyebrow / sur-titre (rappel de la règle 1).
- « en Essonne » (rappel de la règle 2).

## Paragraphe d'introduction

Bref, deux phrases maximum. Le fond ne change pas : « je suis votre
professionnel des travaux de couverture à [Ville], j'entretiens, je répare et je
rénove votre toiture ». La formulation, elle, change à chaque ville.

## Les 3 puces

Trois lignes, choisies dans les cinq familles ci-dessous — **une seule
formulation par famille et par page**, et on ne prend jamais les mêmes trois
familles sur deux villes voisines.

| Famille | Formulations disponibles |
|---|---|
| Expérience | 15 années d'expérience · 15 ans d'expérience sur les toitures du Sud de l'Essonne |
| Statut | Professionnel des travaux de toiture · Expert des travaux de couverture · Artisan seul sur ses chantiers |
| Devis | Devis gratuit et sans engagement · Devis sans engagement · Devis gratuit, déplacement offert |
| Matériaux | Tous matériaux de couverture · Spécialiste de la tuile plate et de la tuile pays |
| Spécialité | Professionnel de l'entretien de toiture · Spécialiste de la rénovation de toiture |

⚠️ **« 15 ans d'expérience » est une donnée client.** `entreprise.json` montre une
immatriculation en 2018 avec une interruption 2021 – mi-2023 : les 15 ans
recouvrent donc le parcours de M. Ribard, salariat compris. À confirmer avec lui
avant mise en ligne.

## Avis

H2 du type « Ils sont satisfaits du travail de leur couvreur à [Ville] »,
formulation variable. **4 avis par page**, sélectionnés par `avisIndex` dans
`villes.json`. Deux pages ne doivent pas afficher le même quatuor : on décale la
sélection dans les 18 avis de `reviews.json`.

## Titre de la section services (H2)

Varie d'une ville à l'autre, clé `titreServices` de `villes.json`.

| # | Modèle |
|---|---|
| A | Mes services de couvreur à [Ville] |
| B | Mes prestations de couverture à [Ville] |
| C | Mon savoir-faire de couvreur à [Ville] |
| D | Ce que je réalise à [Ville] |

## Cards services

- Les **3 premières cards sont toujours dans cet ordre** : nettoyage /
  démoussage → rénovation → réparation. Leur texte est **réécrit pour chaque
  ville**, avec le nom de la commune dedans (clé `services` de `villes.json`).
- Les cards suivantes complètent avec le reste du catalogue, dans un **ordre qui
  change d'une ville à l'autre** (clé `servicesSuite`). Leur texte reste
  l'accroche générique de `services.json`.
- Chaque card pointe vers la page service correspondante.

## CTA final

Photo portrait de l'artisan + un titre qui varie : « Contactez votre artisan
couvreur à [Ville] », « Parlons de votre toiture à [Ville] », « Votre couvreur
à [Ville] vous rappelle », « Contactez votre expert de la toiture à [Ville] ».

---

## Suivi des rotations

| Ville | H1 | Title | Meta | Puces | Avis | H2 services | Photo hero |
|---|---|---|---|---|---|---|---|
| Méréville | A | A | A | Expérience · Matériaux · Devis | 0, 2, 7, 17 | A | renovation-toiture-liteaux-velux |
| Étampes | B | C | B | Statut · Spécialité · Devis | 1, 5, 12, 15 | B | travaux-de-zinguerie |
| Dourdan | D | D | C | Expérience · Matériaux · Statut | 3, 8, 13, 16 | C | nettoyage-de-toiture |
| Étréchy | C | A | D | Devis · Expérience · Spécialité | 4, 6, 10, 17 | D | gouttieres-en-zinc-soudure |
| Saint-Chéron | E | B | A | Matériaux · Devis · Statut | 11, 14, 2, 5 | A | bardage-acier |
| Milly-la-Forêt | F | E | B | Expérience · Matériaux · Devis | 16, 0, 6, 13 | B | double-fenetre-de-toit-velux |
| La Ferté-Alais | G | D | C | Statut · Devis · Spécialité | 8, 17, 3, 10 | C | travaux-de-zinguerie ⚠️ |
| Cerny | B | A | D | Expérience · Statut · Matériaux | 12, 4, 15, 1 | D | bg-couvreurs-toiture |
| Chamarande | D | C | A | Devis · Matériaux · Spécialité | 9, 7, 14, 11 | A | velux-isolation-interieur |
| Abbéville-la-Rivière | F | E | B | Statut · Expérience · Devis | 5, 16, 0, 8 | B | double-fenetre-de-toit-velux ⚠️ |
| Malesherbes (45) | G | B | C | Expérience · Spécialité · Devis | 13, 1, 9, 4 | C | travaux-de-zinguerie ⚠️ |
| Sermaises (45) | A | E | D | Expérience · Matériaux · Devis | 12, 3, 9, 6 | D | renovation-toiture-liteaux-velux ⚠️ |
| Pithiviers (45) | C | A | A | Statut · Spécialité · Devis | 6, 14, 1, 8 | A | double-fenetre-de-toit-velux ⚠️ |
| Puiseaux (45) | E | D | B | Devis · Expérience · Matériaux | 10, 0, 13, 5 | B | gouttieres-en-zinc-soudure ⚠️ |
| Outarville (45) | F | C | C | Matériaux · Expérience · Devis | 15, 7, 4, 16 | C | bg-couvreurs-toiture ⚠️ |
| Beaune-la-Rolande (45) | B | A | D | Statut · Spécialité · Devis | 1, 11, 2, 14 | D | nettoyage-de-toiture ⚠️ |

⚠️ Photo réutilisée : le fonds d'images ne contient que 8 photos assez grandes
pour un hero (≥ 540 px de large). Les répétitions sont placées entre communes
éloignées dans la liste. À corriger dès que M. Ribard fournit de nouveaux
chantiers photographiés.

Toutes les photos de hero sont recadrées en 3/2 par le CSS
(`.hero--ville .hero__photo`), donc n'importe quel format entre correctement.


Aucune formule n'est utilisée deux fois de suite, et aucun couple
H1 / title n'utilise le même modèle. Mettre ce tableau à jour à chaque
nouvelle commune ouverte.

---

## Périmètre de contenu d'une page ville (29/07/2026)

Une page ville parle **uniquement de sa commune**. Interdits dans le corps de
page : le département (« dans l'Essonne », « le 91 »), la commune du siège
(Méréville) et l'adresse postale. Le NAP complet reste dans le pied de page,
présent sur toutes les pages, ce qui suffit à la cohérence des citations.

**Une seule exception : la page du siège** (`siege: true` dans villes.json), qui
porte le bloc adresse + le plan OpenStreetMap. Les dix autres n'ont **ni carte
ni adresse**.

Les communes voisines listées en bas de page restent **dans le même silo** :
une page de l'Essonne ne renvoie que vers l'Essonne, une page du Loiret que vers
le Loiret. Le passage d'un département à l'autre se fait par les deux pages
piliers (`/` et `/couvreur-45/`), présentes dans l'en-tête et le pied de page.

L'avis nº 17 de `reviews.json` nomme Méréville dans son texte : le réserver aux
pages du secteur de Méréville, pas aux communes du Loiret.


---

# Maillage vers les pages piliers

Chaque page service porte **un seul lien contextuel** vers le pilier de son
département, placé en plein corps de texte et non en conclusion.

- Why: Google ne retient que l'ancre du **premier** lien vers une URL donnée
  depuis une page. Un deuxième lien vers la même cible ne fait que diluer,
  et son ancre est perdue.
- How to apply: une ancre différente par page, prise dans le pool ci-dessous.
  Le champ `_maillagePilier` de `services-pages.json` note pour chaque page
  l'ancre utilisée et son emplacement.

## Pool d'ancres vers /couvreur-45/
couvreur 45 · couvreur du Loiret · professionnel de la toiture 45 ·
entreprise de couverture 45 · artisan couvreur dans le Loiret ·
couvreur zingueur 45

## Pool d'ancres vers / (pilier Essonne)
couvreur 91 · couvreur dans l'''Essonne · professionnel de la toiture 91 ·
entreprise de couverture 91 · artisan couvreur du 91 · couvreur zingueur 91

## Attribution actuelle

| Page service | Cible | Ancre |
|---|---|---|
| Nettoyage 45 | /couvreur-45/ | couvreur 45 |
| Rénovation 45 | /couvreur-45/ | entreprise de couverture 45 |
| Réparation 45 | /couvreur-45/ | professionnel de la toiture 45 |
| Gouttières 45 | /couvreur-45/ | couvreur du Loiret |
| Nettoyage 91 | / | couvreur dans l'''Essonne |
| Rénovation 91 | / | entreprise de couverture 91 |
| Réparation 91 | / | professionnel de la toiture 91 |
| Gouttières 91 | / | couvreur 91 |

Les deux ancres restantes de chaque pool sont réservées aux quatre services
encore à ouvrir (isolation, zinguerie, velux, bac acier).
