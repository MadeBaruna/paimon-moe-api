FROM node:24.22.1-slim AS builder
WORKDIR /api
COPY --from=ghcr.io/pnpm/pnpm:12.15.0 /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --shamefully-hoist=true
COPY tsconfig.json .
COPY src src
RUN pnpm run build
RUN pnpm prune --prod

FROM node:24.22.1-slim
WORKDIR /api
COPY ormconfig.js .
COPY --from=builder /api/node_modules node_modules
COPY --from=builder /api/build .
EXPOSE 3001
CMD [ "node", "index.js" ]
