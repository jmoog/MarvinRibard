// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

/**
 * CONTRAINTE ABSOLUE DE CE PROJET
 * -------------------------------
 * Les 33 URLs du site WordPress d'origine sont conservées au caractère près,
 * slash final compris. C'est `trailingSlash: 'always'` + `build.format:
 * 'directory'` qui le garantissent : /contact/ reste /contact/, jamais /contact.
 * Ne pas modifier ces deux options sans revoir tout le plan de redirection.
 */
export default defineConfig({
  site: 'https://marvin-ribard.fr',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,

  // Montserrat auto-hébergée : Astro télécharge les WOFF2 au build et les sert
  // depuis le domaine — conforme RGPD/CNIL, aucune requête vers Google Fonts.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Montserrat',
      cssVariable: '--font-montserrat',
      weights: ['400', '500', '600', '700', '800'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
  ],

  // CSS entièrement inliné dans le HTML → zéro requête CSS bloquante.
  build: {
    inlineStylesheets: 'always',
    format: 'directory',
  },

  /**
   * L'ancienne page /a-propos/ est supprimée (29/07/2026) : son contenu est
   * repris par la section portrait de l'accueil. On ne la laisse PAS tomber en
   * 404 — c'est une des 33 URLs du site WordPress, elle a un historique et des
   * liens entrants. Redirection 301 permanente vers l'accueil, servie par
   * l'adaptateur Node.
   */
  redirects: {
    '/a-propos/': { status: 301, destination: '/' },
  },

  // Adapter Node standalone : sert le statique + la route /api/devis.
  adapter: node({ mode: 'standalone' }),
  security: { checkOrigin: false },

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/merci/'),
      serialize(item) {
        const u = new URL(item.url);
        let path = u.pathname;
        if (!path.endsWith('/')) path += '/';

        // Priorités : accueil > hubs départementaux > services > villes > légal
        const services91 = [
          '/renovation-de-toiture-91/',
          '/reparation-de-toiture-dans-lessonne-91/',
          '/nettoyage-et-demoussage-de-toiture/',
          '/isolation-de-toiture/',
          '/travaux-de-zinguerie/',
          '/pose-et-remplacement-de-gouttiere-dans-lessonne-91/',
          '/pose-et-remplacement-de-velux-dans-l-essonne-91/',
          '/toiture-en-bac-acier-dans-lessonne-91/',
        ];
        const services45 = [
          '/couvreur-45/renovation-de-toiture-dans-le-loiret/',
          '/couvreur-45/reparation-de-toiture-dans-le-loiret-45/',
          '/couvreur-45/isolation-de-toiture-dans-le-loiret/',
          '/couvreur-45/travaux-de-zinguerie-dans-le-loiret/',
          '/couvreur-45/pose-de-gouttieres-dans-le-loiret/',
          '/couvreur-45/toitures-bac-acier-dans-le-loiret-45/',
          '/nettoyage-et-demoussage-de-toiture-dans-le-loiret-45/',
          '/pose-et-remplacement-de-velux-dans-le-loiret-45/',
        ];
        const legal = [
          '/mentions-legales/',
          '/politique-de-confidentialite/',
          '/plan-du-site/',
        ];

        if (path === '/') item.priority = 1.0;
        else if (path === '/couvreur-45/') item.priority = 0.9;
        else if (services91.includes(path) || services45.includes(path)) item.priority = 0.8;
        else if (legal.includes(path)) item.priority = 0.3;
        else item.priority = 0.7; // pages villes, avis, réalisations, contact

        item.changefreq = 'monthly';
        return item;
      },
    }),
  ],
});
