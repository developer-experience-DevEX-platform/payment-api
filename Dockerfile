FROM node:24-bookworm-slim AS build

ENV NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build \
    && npm prune --omit=dev

FROM debian:bookworm-slim AS runtime

# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 1000 node \
    && useradd --uid 1000 --gid node --create-home --shell /usr/sbin/nologin node

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /usr/local/bin/node /usr/local/bin/node
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

USER 1000

EXPOSE 3000

CMD ["node", "dist/server.js"]
