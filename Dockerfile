FROM node:8-alpine
ARG NPM_TOKEN
RUN mkdir -p /usr/src && apk add --no-cache ca-certificates
WORKDIR /usr/src
COPY src /usr/src
RUN yarn --prod
EXPOSE 80
CMD ["node", "."]
