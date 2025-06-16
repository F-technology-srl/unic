FROM node:20-alpine

ARG NPM_TOKEN
ARG VERSION

ENV VERSION=$VERSION
ENV NPM_TOKEN=$NPM_TOKEN

WORKDIR /app

LABEL org.opencontainers.image.source https://github.com/f-technology-srl/unic

COPY /dist/apps/client/dist .

COPY /apps/client/package.json .

RUN npm install -g pnpm

COPY ./.npmrc .
RUN echo "@f-technology-srl:registry=https://npm.pkg.github.com" > .npmrc && echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc

#force pnpm to create folder node_modules and not use global cache
RUN pnpm install --shamefully-hoist


ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "server/entry.mjs"]