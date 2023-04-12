FROM node:18.15.0-alpine3.16 AS builder
WORKDIR /api
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --shamefully-hoist=true
COPY tsconfig.json .
COPY src src
RUN pnpm run build
RUN pnpm prune --prod

FROM node:18.15.0-alpine3.16
WORKDIR /api
COPY ormconfig.js .
COPY --from=builder /api/node_modules node_modules
COPY --from=builder /api/build .
EXPOSE 3001
CMD [ "node", "index.js" ]
