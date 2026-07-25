# ---- Builder stage ----
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY . .
RUN yarn build

# ---- Runner stage ----
FROM node:24-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src/common/generated ./src/common/generated
COPY scripts/init-db.sh ./scripts/init-db.sh

RUN chmod +x scripts/init-db.sh

EXPOSE 3000

CMD ["sh", "-c", "./scripts/init-db.sh && exec node dist/main"]
