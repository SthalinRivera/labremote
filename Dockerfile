# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ARG API_BASE_URL
ARG NODE_ENV=production

ENV API_BASE_URL=$API_BASE_URL
ENV NODE_ENV=$NODE_ENV

RUN npm run build

# ----------------------------

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]