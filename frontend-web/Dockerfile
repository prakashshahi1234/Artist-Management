# 1. Base image for dependencies
FROM node:22 AS deps

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install -f

# 2. Build stage
FROM node:22 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 3. Production image
FROM node:22 AS runner

WORKDIR /app

ENV NODE_ENV=production

# Only copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
