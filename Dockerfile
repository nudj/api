FROM node:6.11.1-alpine
ARG NPM_TOKEN
RUN mkdir -p /usr/src
WORKDIR /usr/src
COPY src /usr/src
RUN npm i --production
EXPOSE 81 82
CMD ["node", "."]
