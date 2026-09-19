# syntax=docker/dockerfile:1

# basilmyq.com — multi-stage build for Coolify.
#
# The final image carries the Next.js standalone server, the Prisma CLI needed
# to apply migrations on boot, and nothing else. It runs as a non-root user.

ARG NODE_VERSION=24-alpine

# ---------------------------------------------------------------------------
# 1. Dependencies
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# Installed from the lockfile so the image matches what was tested.
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# 2. Build
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The Prisma client is generated into src/generated and is gitignored, so it
# has to be produced here rather than copied in.
RUN npx prisma generate

# `next build` needs a DATABASE_URL to type-check, but it never connects: the
# public queries are only executed for routes that are prerendered, and those
# run against the real database at deploy time.
ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npm run build

# ---------------------------------------------------------------------------
# 3. Migrator — the Prisma CLI, installed on its own
# ---------------------------------------------------------------------------
# Copying `node_modules/prisma` out of the build stage is not enough: the CLI
# needs its full dependency tree (mysql2, postgres, c12, effect, …) and
# `node_modules/.bin/prisma` is a symlink that COPY flattens into a broken
# file. Installing it here, at the exact versions from the lockfile, gives a
# small self-contained folder that runs `migrate deploy`.
FROM node:${NODE_VERSION} AS migrator
WORKDIR /migrate

COPY --from=deps /app/node_modules/prisma/package.json /tmp/prisma.json
COPY --from=deps /app/node_modules/dotenv/package.json /tmp/dotenv.json
RUN npm init -y > /dev/null \
  && npm install --omit=dev --no-audit --no-fund \
    "prisma@$(node -p "require('/tmp/prisma.json').version")" \
    "dotenv@$(node -p "require('/tmp/dotenv.json').version")"

COPY prisma ./prisma
COPY prisma7.config.ts ./prisma7.config.ts

# ---------------------------------------------------------------------------
# 4. Runtime
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# The standalone bundle already contains a pruned node_modules and server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Needed at boot to apply migrations. The Prisma CLI lives in its own folder
# with a complete dependency tree (see the `migrator` stage): the standalone
# bundle's pruned node_modules cannot run it.
COPY --from=migrator --chown=nextjs:nodejs /migrate ./migrate

# Uploaded images. Mount a persistent volume at /app/uploads, or every
# redeploy empties the media library.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads
ENV UPLOAD_DIR=/app/uploads
VOLUME ["/app/uploads"]

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000

# Coolify reads this; it checks the database round-trip, not just the port.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
