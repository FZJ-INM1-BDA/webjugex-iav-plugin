FROM node:8

ARG HOSTNAME
ARG BACKEND_URL

COPY . /webjugex-frontend
WORKDIR /webjugex-frontend
RUN npm i
RUN npm run build
RUN cp ./public/template.html ./dist/

ENV HOSTNAME=$HOSTNAME
ENV PLUGIN_NAME=fzj.xg.webjugex
ENV PLUGIN_DISPLAY_NAME=WebJuGEx
ENV BACKEND_URL=$BACKEND_URL
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT [ "node", "deployServer.js"]