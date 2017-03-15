FROM node:6.10.0-alpine
ARG NPM_TOKEN
RUN mkdir -p /usr/src
WORKDIR /usr/src
COPY src /usr/src
RUN npm i --production
EXPOSE 3000
CMD node .
