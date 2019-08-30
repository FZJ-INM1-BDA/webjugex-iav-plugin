FROM node:8 as builder

ARG HOSTNAME
ARG VUE_APP_BACKEND_URL
ARG BACKEND_URL
ARG PORT
ARG VUE_APP_PMAP_URL

ENV VUE_APP_PMAP_URL=$VUE_APP_PMAP_URL
ENV BACKEND_URL=$BACKEND_URL
ENV HOSTNAME=$HOSTNAME
ENV VUE_APP_BACKEND_URL=$VUE_APP_BACKEND_URL
ENV PORT=$PORT
COPY . /webjugex-frontend
WORKDIR /webjugex-frontend
RUN npm i

# Run tests. If fails, stop container
RUN npm run test

# Build ssr
RUN npm run build-ssr

FROM node:8-alpine

ENV NODE_ENV=production
RUN mkdir /webjugex-frontend

COPY --from=builder /webjugex-frontend/deploy /webjugex-frontend/deploy
COPY --from=builder /webjugex-frontend/vueSsr/distSsr /webjugex-frontend/deploy/distSsr

WORKDIR /webjugex-frontend/deploy
RUN npm i

ENTRYPOINT [ "node", "server.js"]