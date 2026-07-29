# syntax=docker/dockerfile:1.7
# ────────────────────────────────────────────────────────────────────────
# Astro 6 + adapter Node (standalone) — Dockerfile multi-stage
# marvin-ribard.fr — déployé via Coolify (même montage que charles-lopez.fr)
# ────────────────────────────────────────────────────────────────────────

# ── Stage 1 : build ─────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Cache layer optimisé : package*.json d'abord
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Variables Turnstile passées par Coolify en "build variable" (--build-arg).
ARG TURNSTILE_SITE_KEY
ENV TURNSTILE_SITE_KEY=$TURNSTILE_SITE_KEY

COPY . .
RUN npm run build

# ── Stage 2 : runtime ───────────────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# La route /api/devis (prerender=false) lit process.env au runtime : on refige
# les clés Turnstile dans l'env du conteneur. La clé SITE sert aussi au BUILD,
# pour être injectée dans le HTML de /contact/ ; la clé SECRET ne sert qu'au
# runtime et ne doit jamais atteindre le HTML.
ARG TURNSTILE_SITE_KEY
ARG TURNSTILE_SECRET_KEY
ENV TURNSTILE_SITE_KEY=$TURNSTILE_SITE_KEY
ENV TURNSTILE_SECRET_KEY=$TURNSTILE_SECRET_KEY

# Dépendances de production uniquement
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist

# Utilisateur non-root
RUN addgroup -S astro && adduser -S astro -G astro && \
    chown -R astro:astro /app
USER astro

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
