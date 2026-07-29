/**
 * Fabriques de schémas JSON-LD.
 *
 * Toutes les entités renvoyées référencent l'entreprise par son `@id` stable
 * (`https://marvin-ribard.fr/#localbusiness`, déclaré une seule fois dans
 * BaseLayout). C'est ce qui permet à Google de consolider une entité unique —
 * exactement ce qui manquait sur le site WordPress, où cinq schémas
 * ProfessionalService portaient chacun un nom de service différent.
 */
import ent from '../data/entreprise.json';

export const SITE = 'https://marvin-ribard.fr';
export const ID_ENTREPRISE = `${SITE}/#localbusiness`;

const abs = (chemin: string) => new URL(chemin, SITE).toString();

/** Fil d'Ariane. `items` va du plus général au plus précis, accueil exclu. */
export function breadcrumb(items: { nom: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: abs('/') },
      ...items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: it.nom,
        item: abs(it.url),
      })),
    ],
  };
}

/** Service rendu par l'entreprise sur une zone donnée. */
export function service(opts: {
  nom: string;
  description: string;
  url: string;
  zone: string;
  type?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.nom,
    description: opts.description,
    url: abs(opts.url),
    serviceType: opts.type || opts.nom,
    provider: { '@id': ID_ENTREPRISE },
    areaServed: { '@type': 'AdministrativeArea', name: opts.zone },
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: ent.telephoneUri,
      serviceUrl: abs('/contact/'),
    },
  };
}

/** Questions fréquentes. Ne pas déclarer une FAQ absente du HTML visible. */
export function faq(questions: { q: string; r: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.r },
    })),
  };
}

/**
 * ⛔ PAS DE BALISAGE D'AVIS SUR CE SITE — décision volontaire.
 *
 * Google exclut les avis auto-déclarés sur son propre site (« self-serving
 * reviews ») des rich results LocalBusiness et Organization. Publier un
 * AggregateRating ou des Review pour sa propre entreprise :
 *   — n'affiche aucune étoile en SERP (le type est simplement ignoré) ;
 *   — expose à une action manuelle « extraits d'avis non conformes ».
 *
 * Les 18 avis restent affichés en contenu visible (AvisCarrousel + page
 * /avis-clients/), et la fiche Google Business Profile est déclarée en
 * `sameAs` sur l'entité principale. C'est elle qui porte les étoiles.
 *
 * Ne pas réintroduire de fonction avisClients().
 */

/** Page « couvreur à [ville] » — l'entreprise vue depuis une commune. */
export function pageVille(v: { nom: string; cp: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Couvreur à ${v.nom} (${v.cp})`,
    description: `Travaux de couverture, réparation, rénovation et entretien de toiture à ${v.nom} (${v.cp}) par ${ent.nom}.`,
    url: abs(v.url),
    provider: { '@id': ID_ENTREPRISE },
    areaServed: {
      '@type': 'City',
      name: v.nom,
      address: {
        '@type': 'PostalAddress',
        postalCode: v.cp,
        addressLocality: v.nom,
        addressCountry: 'FR',
      },
    },
  };
}
