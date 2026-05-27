FROM node:22-alpine

RUN apk add --no-cache \
    git \
    curl \
    redis

WORKDIR /app

COPY ./socket-server/package*.json ./
RUN npm install

COPY ./socket-server/src ./src

EXPOSE 3001

CMD ["node", "src/index.js"]
