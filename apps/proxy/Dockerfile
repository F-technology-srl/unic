FROM nginx:1.19-alpine

WORKDIR /var/www/unic-proxy

LABEL org.opencontainers.image.source https://github.com/f-technology-srl/unic-proxy

COPY apps/proxy/src/client.conf.template /etc/nginx/templates/client.conf.template