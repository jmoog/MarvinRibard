import type { APIRoute } from 'astro';

/**
 * WordPress publiait son plan XML sur /sitemap.xml. Astro génère désormais
 * /sitemap-index.xml : sans cette route, l'ancienne adresse — déclarée en
 * Search Console et suivie par les robots tiers — tomberait en 404.
 *
 * Pourquoi un endpoint et pas une entrée dans `redirects` : avec
 * `trailingSlash: 'always'`, Astro compile les redirections de config en
 * motifs qui EXIGENT le slash final (`^\/sitemap\.xml\/$`). La requête réelle
 * arrive sans slash, ne matche jamais, et retombe en 404. L'endpoint, lui,
 * répond bien sur /sitemap.xml.
 *
 * `prerender = false` : la redirection est servie au runtime par l'adaptateur
 * Node, comme /a-propos/ — pas de fichier HTML avec meta-refresh.
 */
export const prerender = false;

export const GET: APIRoute = ({ redirect }) => redirect('/sitemap-index.xml', 301);
