FROM node:6.10.0-alpine
RUN mkdir -p /usr/www
WORKDIR /usr/www
COPY package.json /usr/www/package.json
RUN npm i --production
COPY src /usr/www/src
EXPOSE 3001
CMD node .
