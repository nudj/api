FROM node:6.10.0-alpine
RUN mkdir -p /usr/src
WORKDIR /usr/src
COPY src /usr/src
COPY .cache /usr/src/node_modules
RUN npm i --production
EXPOSE 81
CMD node .
