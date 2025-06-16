FROM node:20-alpine

ARG NPM_TOKEN
ARG VERSION

ENV VERSION=$VERSION
ENV NPM_TOKEN=$NPM_TOKEN

LABEL org.opencontainers.image.source https://github.com/f-technology-srl/unic-api

WORKDIR /app

COPY dist/apps/api .

RUN npm install -g pnpm

COPY ./.npmrc .
RUN echo "@f-technology-srl:registry=https://npm.pkg.github.com" > .npmrc && echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc

RUN pnpm install --production

CMD ["node", "main.js"]