# Install dependencies only when needed
FROM node:16-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.* .npmrc ./
RUN npm ci --unsafe-perm --production --ignore-scripts --prefer-offline

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
ARG RELEASE
ENV RELEASE=$RELEASE
ENV NODE_ENV production
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npm install
RUN npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app
ARG RELEASE
ENV RELEASE=$RELEASE

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Start from scratch and include only relevant files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
#COPY --from=builder /app/.env ./
RUN mkdir video

USER nextjs

EXPOSE 10130
#ENTRYPOINT ["tail", "-f", "/dev/null"]
#CMD ["node", ".next/server/index.js"]
CMD ["./node_modules/.bin/next", "start"]
