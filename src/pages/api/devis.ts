import type { APIRoute } from 'astro';
import { spamScore, type DevisData } from '../../lib/antispam';
import ent from '../../data/entreprise.json';
import services from '../../data/services.json';

// Route exécutée à la demande, jamais prérendue.
export const prerender = false;

// ────────────────────────────────────────────────────────────────────────
// FORMULAIRE DE DEVIS — marvin-ribard.fr
//
// Architecture reprise de charles-lopez.fr, éprouvée sur les autres sites :
//   · envoi par l'API HTTPS de Brevo, pas par SMTP. Le port 443 passe partout,
//     alors que le SMTP sortant est bloqué chez la plupart des hébergeurs ;
//   · quatre couches anti-spam empilées, de la moins coûteuse à la plus coûteuse :
//       1. honeypot   — champ invisible que seuls les robots remplissent
//       2. time-trap  — soumission en moins de 3 s = robot
//       3. Turnstile  — vérification Cloudflare (active si la clé est posée)
//       4. scoring    — analyse du contenu, règles chargées d'un JSON central
//     Les couches 1, 2 et 4 renvoient volontairement `ok: true` : un spammeur
//     qui reçoit une erreur adapte son script, un spammeur qui croit avoir
//     réussi recommence à l'identique.
//
// Variables d'environnement : voir .env.example à la racine du projet.
//
// ⚠️ Le NAP vient de src/data/entreprise.json, comme partout ailleurs sur le
// site. Ne jamais réécrire le téléphone, l'email ou l'adresse en dur ici.
// ────────────────────────────────────────────────────────────────────────

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Libellés des prestations. Les clés restent alignées sur le <select> de
// src/pages/contact.astro, qui les génère depuis le même services.json.
const PRESTATION_LABELS: Record<string, string> = Object.fromEntries([
  ...services.map((s) => [s.cle, s.label]),
  ['urgence', 'Urgence : fuite ou infiltration en cours'],
  ['autre', 'Autre / à préciser'],
]);

// Charte des emails — alignée sur la palette de src/styles/global.css
const COLOR_BLUE   = '#1b3a6b'; // --bleu
const COLOR_BLUE_D = '#12294c'; // --bleu-fonce
const COLOR_ORANGE = '#e8912d'; // --rouge (orange du logo)
const COLOR_LIGHT  = '#f7f9fc'; // --gris-50
const COLOR_TEXT   = '#16202e'; // --noir
const COLOR_MUTED  = '#6b7482'; // --gris-500
const COLOR_BORDER = '#e2e7ee'; // --gris-200

const SITE_URL   = 'https://marvin-ribard.fr';
const TEL        = ent.telephone;
const TEL_HREF   = `tel:${ent.telephoneUri}`;
const ARTISAN    = ent.nomExploitant;
const ENTREPRISE = `${ent.nom} - Artisan couvreur dans ${ent.zone.libelleLong}`;
// PNG et non WebP : Outlook et plusieurs webmails ne lisent pas le WebP.
const LOGO_URL   = `${SITE_URL}/images/email/logo-marvin-ribard-512.png`;
const ICON_PHONE = `${SITE_URL}/images/email/icon-phone-white.png`;
const ICON_MAIL  = `${SITE_URL}/images/email/icon-mail-white.png`;

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────

function escapeHtml(s: unknown): string {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2br(s: unknown): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

// ────────────────────────────────────────────────────────────────────────
// Client Brevo (fetch direct sur l'API HTTPS, sans SDK)
// ────────────────────────────────────────────────────────────────────────

interface BrevoSendArgs {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  to: Array<{ email: string; name?: string }>;
  replyTo?: { email: string; name?: string };
  subject: string;
  htmlContent: string;
}

async function brevoSend(args: BrevoSendArgs): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const body: Record<string, unknown> = {
    sender: { email: args.fromEmail, name: args.fromName },
    to: args.to,
    subject: args.subject,
    htmlContent: args.htmlContent,
  };
  if (args.replyTo) body.replyTo = args.replyTo;

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': args.apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        if (err?.message) detail = String(err.message);
        else if (err?.code) detail = String(err.code);
      } catch {}
      return { ok: false, error: detail };
    }

    const json = await res.json().catch(() => ({} as any));
    return { ok: true, messageId: json?.messageId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

// ────────────────────────────────────────────────────────────────────────
// Email 1 — notification à l'artisan
// ────────────────────────────────────────────────────────────────────────

function notifTemplate(d: DevisData) {
  const presta = PRESTATION_LABELS[d.prestation] || d.prestation || 'Non précisé';
  const telClean = (d.tel || '').replace(/[^0-9+]/g, '');
  const subject = `Nouvelle demande - ${presta} à ${d.ville}`;
  const prenom = (d.nom || '').split(' ')[0] || 'le client';

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${COLOR_LIGHT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLOR_TEXT};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${COLOR_LIGHT};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(18,41,76,0.08);">
        <tr><td style="background:${COLOR_BLUE_D};padding:22px 28px;color:#fff;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td valign="middle" width="84" style="padding-right:16px;">
                <img src="${LOGO_URL}" width="72" height="72" alt="${escapeHtml(ENTREPRISE)}" style="display:block;width:72px;height:72px;border-radius:14px;background:#fff;padding:8px;box-sizing:border-box;">
              </td>
              <td valign="middle">
                <div style="font-size:22px;font-weight:800;line-height:1.2;">${escapeHtml(presta)}</div>
                <div style="font-size:14px;opacity:.85;margin-top:4px;">à ${escapeHtml(d.ville)}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 28px 8px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${COLOR_MUTED};font-weight:700;margin-bottom:8px;">Client</div>
          <div style="font-size:18px;font-weight:700;color:${COLOR_BLUE_D};">${escapeHtml(d.nom)}</div>
        </td></tr>

        <tr><td style="padding:8px 28px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="50%" valign="top" style="padding:12px 12px 12px 0;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${COLOR_MUTED};font-weight:700;">Téléphone</div>
                <a href="tel:${escapeHtml(telClean)}" style="display:inline-block;margin-top:4px;color:${COLOR_BLUE};font-size:18px;font-weight:700;text-decoration:none;padding:6px 0;">${escapeHtml(d.tel)}</a>
              </td>
              <td width="50%" valign="top" style="padding:12px 0 12px 12px;border-left:1px solid ${COLOR_BORDER};">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${COLOR_MUTED};font-weight:700;">Email</div>
                <a href="mailto:${escapeHtml(d.email)}" style="display:inline-block;margin-top:4px;color:${COLOR_BLUE};font-size:14px;font-weight:600;text-decoration:none;word-break:break-all;">${escapeHtml(d.email)}</a>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:8px 28px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr><td align="center" style="padding:8px 0;">
              <a href="tel:${escapeHtml(telClean)}" style="display:inline-block;background:${COLOR_ORANGE};color:#fff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:700;font-size:16px;line-height:1;">
                <img src="${ICON_PHONE}" width="18" height="18" alt="" style="vertical-align:middle;margin-right:9px;border:0;">
                <span style="vertical-align:middle;">Rappeler ${escapeHtml(prenom)} — ${escapeHtml(d.tel)}</span>
              </a>
            </td></tr>
            <tr><td align="center" style="padding:8px 0;">
              <a href="mailto:${escapeHtml(d.email)}?subject=${encodeURIComponent('Votre demande de devis - ' + ent.nom)}" style="display:inline-block;background:${COLOR_BLUE};color:#fff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:700;font-size:16px;line-height:1;">
                <img src="${ICON_MAIL}" width="18" height="18" alt="" style="vertical-align:middle;margin-right:9px;border:0;">
                <span style="vertical-align:middle;">Répondre par email</span>
              </a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 28px 24px;">
          <div style="background:${COLOR_LIGHT};border-radius:8px;padding:18px 20px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${COLOR_MUTED};font-weight:700;margin-bottom:10px;">Description du chantier</div>
            <div style="font-size:14px;line-height:1.65;color:${COLOR_TEXT};">
              ${d.message ? nl2br(d.message) : '<em style="color:' + COLOR_MUTED + ';">Aucune description fournie.</em>'}
            </div>
          </div>
        </td></tr>

        <tr><td style="background:${COLOR_LIGHT};padding:16px 28px;border-top:1px solid ${COLOR_BORDER};font-size:12px;color:${COLOR_MUTED};text-align:center;">
          Demande reçue le ${new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' })}<br>
          via <a href="${SITE_URL}/contact/" style="color:${COLOR_BLUE};text-decoration:none;">marvin-ribard.fr/contact/</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}

// ────────────────────────────────────────────────────────────────────────
// Email 2 — accusé de réception au client
// ────────────────────────────────────────────────────────────────────────

function ackTemplate(d: DevisData) {
  const presta = PRESTATION_LABELS[d.prestation] || d.prestation || 'votre demande';
  const subject = `Votre demande de devis est bien arrivée - ${ent.nom}`;
  const prenom = (d.nom || '').split(' ')[0];

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${COLOR_LIGHT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLOR_TEXT};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${COLOR_LIGHT};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(18,41,76,0.08);">
        <tr><td style="background:${COLOR_BLUE_D};padding:30px 28px 26px;color:#fff;text-align:center;">
          <img src="${LOGO_URL}" width="110" height="110" alt="${escapeHtml(ENTREPRISE)}" style="display:block;width:110px;height:110px;margin:0 auto 14px;border-radius:18px;background:#fff;padding:12px;box-sizing:border-box;">
          <div style="font-size:20px;font-weight:800;">${escapeHtml(ent.nom)}</div>
          <div style="font-size:13px;opacity:.85;margin-top:2px;">Artisan couvreur zingueur — ${escapeHtml(ent.adresse.villeUsuelle)}</div>
        </td></tr>

        <tr><td style="padding:30px 28px 12px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${COLOR_BLUE_D};line-height:1.3;">Bonjour ${escapeHtml(prenom)},</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${COLOR_TEXT};">
            J'ai bien reçu votre demande concernant <strong>${escapeHtml(presta.toLowerCase())}</strong> à <strong>${escapeHtml(d.ville)}</strong>.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${COLOR_TEXT};">
            Je vous rappelle sous <strong>48 heures</strong> pour convenir d'un rendez-vous. Je viens voir votre toiture, je vous explique ce qu'elle demande, et je vous remets un devis détaillé poste par poste — gratuit et sans engagement.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:${COLOR_TEXT};">
            Si l'eau entre déjà chez vous, n'attendez pas mon rappel : appelez-moi directement.
          </p>
        </td></tr>

        <tr><td style="padding:0 28px 24px;" align="center">
          <a href="${TEL_HREF}" style="display:inline-block;background:${COLOR_ORANGE};color:#fff;text-decoration:none;padding:15px 32px;border-radius:10px;font-weight:700;font-size:16px;line-height:1;">
            <img src="${ICON_PHONE}" width="18" height="18" alt="" style="vertical-align:middle;margin-right:9px;border:0;">
            <span style="vertical-align:middle;">Appeler le ${escapeHtml(TEL)}</span>
          </a>
        </td></tr>

        <tr><td style="padding:0 28px 28px;">
          <div style="background:${COLOR_LIGHT};border-radius:8px;padding:18px 20px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:${COLOR_MUTED};font-weight:700;margin-bottom:12px;">Récapitulatif de votre demande</div>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size:14px;">
              <tr><td style="padding:4px 0;color:${COLOR_MUTED};width:120px;">Prestation</td>
                  <td style="padding:4px 0;color:${COLOR_TEXT};font-weight:600;">${escapeHtml(presta)}</td></tr>
              <tr><td style="padding:4px 0;color:${COLOR_MUTED};">Commune</td>
                  <td style="padding:4px 0;color:${COLOR_TEXT};font-weight:600;">${escapeHtml(d.ville)}</td></tr>
              <tr><td style="padding:4px 0;color:${COLOR_MUTED};">Téléphone</td>
                  <td style="padding:4px 0;color:${COLOR_TEXT};font-weight:600;">${escapeHtml(d.tel)}</td></tr>
            </table>
          </div>
        </td></tr>

        <tr><td style="padding:0 28px 28px;">
          <p style="margin:0;font-size:15px;line-height:1.5;color:${COLOR_TEXT};">
            À bientôt,<br>
            <strong style="color:${COLOR_BLUE_D};">${escapeHtml(ARTISAN)}</strong><br>
            <span style="color:${COLOR_MUTED};font-size:13px;">Artisan couvreur zingueur</span>
          </p>
        </td></tr>

        <tr><td style="background:${COLOR_BLUE_D};padding:20px 28px;color:#fff;text-align:center;font-size:12px;line-height:1.6;">
          <strong style="font-size:14px;">${escapeHtml(ent.nom)}</strong><br>
          ${escapeHtml(ent.adresse.rue)}, ${escapeHtml(ent.adresse.codePostal)} ${escapeHtml(ent.adresse.ville)}<br>
          <a href="${SITE_URL}" style="color:#fff;text-decoration:underline;opacity:.85;">marvin-ribard.fr</a> &nbsp;·&nbsp; <a href="${TEL_HREF}" style="color:#fff;text-decoration:underline;opacity:.85;">${escapeHtml(TEL)}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}

// ────────────────────────────────────────────────────────────────────────
// POST /api/devis
// ────────────────────────────────────────────────────────────────────────

const jsonResponse = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[devis] BREVO_API_KEY manquante');
    return jsonResponse(500, { ok: false, error: 'Configuration serveur incomplète.' });
  }

  let raw: any;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: 'Requête invalide.' });
  }

  // Anti-spam 1 — honeypot : champ invisible, rempli seulement par les robots.
  if (raw?.website && String(raw.website).trim() !== '') {
    console.warn('[devis] spam bloqué (honeypot)');
    return jsonResponse(200, { ok: true });
  }

  // Anti-spam 2 — time-trap : moins de 3 s entre l'affichage et l'envoi.
  if (raw?.ts) {
    const elapsed = Date.now() - Number(raw.ts);
    if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 3000) {
      console.warn(`[devis] spam bloqué (time-trap, ${elapsed} ms)`);
      return jsonResponse(200, { ok: true });
    }
  }

  // Anti-spam 3 — Cloudflare Turnstile, vérifié seulement si la clé est posée.
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = typeof raw?.['cf-turnstile-response'] === 'string' ? raw['cf-turnstile-response'].trim() : '';
    if (!token) {
      return jsonResponse(400, { ok: false, error: 'Merci de valider le test anti-robot.' });
    }
    try {
      const ip = request.headers.get('cf-connecting-ip')
        || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || '';
      const params = new URLSearchParams({ secret: turnstileSecret, response: token });
      if (ip) params.set('remoteip', ip);
      const tRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const tOut: any = await tRes.json().catch(() => ({}));
      if (!tOut?.success) {
        return jsonResponse(400, { ok: false, error: 'Vérification anti-robot échouée, merci de réessayer.' });
      }
    } catch {
      return jsonResponse(502, { ok: false, error: `Vérification anti-robot indisponible, merci de m'appeler au ${TEL}.` });
    }
  }

  // Champs obligatoires
  const required = ['nom', 'tel', 'email', 'ville', 'prestation'] as const;
  for (const f of required) {
    if (!raw?.[f] || String(raw[f]).trim() === '') {
      return jsonResponse(400, { ok: false, error: `Champ manquant : ${f}` });
    }
  }

  const data: DevisData = {
    nom:        String(raw.nom).trim().slice(0, 100),
    tel:        String(raw.tel).trim().slice(0, 30),
    email:      String(raw.email).trim().slice(0, 200),
    ville:      String(raw.ville).trim().slice(0, 100),
    prestation: String(raw.prestation).trim().slice(0, 80),
    message:    String(raw.message || '').trim().slice(0, 4000),
  };

  // Anti-spam 4 — scoring du contenu (démarchage SEO, avis Google, courtage…).
  // Règles chargées d'un JSON central partagé entre tous les sites.
  const verdict = await spamScore(data);
  if (verdict.score >= verdict.threshold) {
    console.warn(
      `[devis] spam bloqué (score ${verdict.score}/${verdict.threshold}, règles ${verdict.version}) — ` +
      `${verdict.reasons.join(', ')} — tel="${data.tel}" email="${data.email}"`
    );
    return jsonResponse(200, { ok: true });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) {
    console.error('[devis] ADMIN_EMAILS manquante');
    return jsonResponse(500, { ok: false, error: 'Configuration serveur incomplète.' });
  }

  const fromEmail = process.env.FROM_EMAIL || ent.email;
  const fromName  = process.env.FROM_NAME  || ENTREPRISE;

  // 1) Notification à l'artisan — bloquante : si elle échoue, le visiteur doit
  //    le savoir et pouvoir appeler.
  const notif = notifTemplate(data);
  const r1 = await brevoSend({
    apiKey,
    fromEmail,
    fromName,
    to: adminEmails.map((email) => ({ email })),
    replyTo: { email: data.email, name: data.nom },
    subject: notif.subject,
    htmlContent: notif.html,
  });

  if (!r1.ok) {
    console.error('[devis] échec notification artisan (Brevo) :', r1.error);
    return jsonResponse(502, {
      ok: false,
      error: `Envoi impossible pour le moment, merci de m'appeler au ${TEL}.`,
    });
  }

  // 2) Accusé au client — best effort : son échec ne doit pas faire croire au
  //    visiteur que sa demande n'est pas partie, elle l'est.
  const ack = ackTemplate(data);
  const r2 = await brevoSend({
    apiKey,
    fromEmail,
    fromName: `${ARTISAN} - Artisan couvreur`,
    to: [{ email: data.email, name: data.nom }],
    replyTo: { email: fromEmail, name: fromName },
    subject: ack.subject,
    htmlContent: ack.html,
  });
  if (!r2.ok) {
    console.error('[devis] échec accusé client (non bloquant) :', r2.error);
  }

  return jsonResponse(200, { ok: true });
};

// Les autres méthodes sont refusées proprement.
export const GET: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
