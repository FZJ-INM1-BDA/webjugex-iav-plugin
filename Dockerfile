FROM node:8

ARG HOSTNAME
ARG VUE_APP_BACKEND_URL

ENV HOSTNAME=$HOSTNAME
ENV PLUGIN_NAME=fzj.xg.webjugex
ENV PLUGIN_DISPLAY_NAME=JuGEx\ differential\ gene\ expression\ analysis
ENV VUE_APP_BACKEND_URL=$VUE_APP_BACKEND_URL
ENV PORT=3000

COPY . /webjugex-frontend
WORKDIR /webjugex-frontend
RUN npm i
RUN npm run build
RUN cp ./public/template.html ./dist/

EXPOSE 3000

ENTRYPOINT [ "node", "deployServer.js"]