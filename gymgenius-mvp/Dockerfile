# Multi-stage build za optimizaciju veličine image-a

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Kopiraj package files
COPY package*.json ./

# Instaliraj dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Kopiraj dependencies iz prethodnog stage-a
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Instaliraj sve dependencies (uključujući devDependencies za build)
RUN npm ci

# Build Next.js aplikacije
RUN npm run build

# Stage 3: Runner (production)
FROM node:20-alpine AS runner
WORKDIR /app

# Postavi environment na production
ENV NODE_ENV=production

# Kreiraj non-root korisnika za bezbednost
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiraj public folder sa ispravnim vlasnistvom
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Kreiraj uploads direktorijum sa ispravnim permisijama (za runtime upload-ove)
RUN mkdir -p ./uploads/progress-photos && chown -R nextjs:nodejs ./uploads

# Kopiraj build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prebaci se na non-root korisnika
USER nextjs

# Expose port
EXPOSE 3000

# Environment varijabla za port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start aplikacije
CMD ["node", "server.js"]
