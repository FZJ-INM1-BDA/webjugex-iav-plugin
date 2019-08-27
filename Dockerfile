FROM node:8

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

ENTRYPOINT [ "node", "vueSsr/deployServer.js"]